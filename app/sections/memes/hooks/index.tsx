import { useEffect, useMemo, useRef, useState } from 'react';
import { httpAuthGet, httpAuthPost, httpGet, timeAgo } from '@/app/utils';
import { PublicKey } from '@solana/web3.js';
import { programId_address } from '@/app/utils/config';
import Big from 'big.js';
import { Program } from '@coral-xyz/anchor';
import idl from '@/app/hooks/meme_launchpad.json';
import { useConnection } from '@solana/wallet-adapter-react';
import { Hot, Meme, useMemesListStore } from '@/app/sections/memes/store/list';
import { MemesState, useMemesStore } from '@/app/sections/memes/store';
import {
  MemePhase,
  MemePhaseType,
  MemePlatform,
  MemePlatformItem,
  MemeSort,
} from '@/app/sections/memes/config';
import { useDebounceFn, useRequest, useThrottleFn } from 'ahooks';
import { fetchData, getGranularityByResolution } from '@/app/components/chart/fetch-data';
import { getTokenMeta } from '@/app/utils/solanaScanApi';
import { DebouncedFunc, minBy, trim } from 'lodash-es';
import { useAccount } from '@/app/hooks/useAccount';
import { useAuth } from '@/app/context/auth';
import { GridTableSortDirection } from '@/app/components/grid-table';

export function useMemes(props?: { isLoadData?: boolean }): Memes {
  const { isLoadData } = props ?? {};

  const {
    hotList,
    hotListLoading,
    setHotList,
    setHotListLoading,
    memesAllList,
    memesGenesisList,
    memesImportList,
    memesListedList,
    memesTickingList,
    memesListLoading,
    memesListPageLimit,
    memesListPageNext,
    memesListPageOffset,
    setMemesAllList,
    setMemesListedList,
    setMemesTickingList,
    setMemesImportList,
    setMemesGenesisList,
    setMemesListLoading,
    setMemesListPageOffset,
    setMemesListPageNext,
    memesListCountdown,
    setMemesListCountdown,
    memesListHolders,
    setMemesListHolders,
    memesHoldersQueue,
    setMemesHoldersQueue,
    spliceMemesHoldersQueue,
    memesListHoldersLoading,
    setMemesListHoldersLoading,

    memesListSortDataIndex,
    memesListSortDirection,
    memesListPlatform,
    setMemesListSortDataIndex,
    setMemesListSortDirection,
    setMemesListPlatform,
    memesListSearchText,
    setMemesListSearchText,
  } = useMemesListStore();
  const { currentTab, setCurrentTab } = useMemesStore();
  const { connection } = useConnection();
  const { address } = useAccount();
  const { accountRefresher } = useAuth();

  const memesContainerRef = useRef<any>();
  const [holdersLoading, setHoldersLoading] = useState(false);

  const _currentMemesList = (_type: string) => {
    if (_type === MemePhaseType.All) {
      return memesAllList;
    }
    if (_type === MemePhaseType.New) {
      return memesGenesisList;
    }
    if (_type === MemePhaseType.Bonding) {
      return memesTickingList;
    }
    if (_type === MemePhaseType.Listed) {
      return memesListedList;
    }
    // if (_type === 'pump') {
    //   return memesImportList;
    // }
    // if (_type === 'gofund') {
    //   return memesImportList;
    // }
    return [];
  };

  const listShown = useMemo<Hot[] | Meme[]>(() => {
    return _currentMemesList(currentTab.type);
  }, [
    hotList,
    memesAllList,
    memesGenesisList,
    memesImportList,
    memesListedList,
    memesTickingList,
    currentTab,
    _currentMemesList
  ]);

  const getMemeHolders = async (address: string) => {
    setHoldersLoading(true);
    setMemesListHoldersLoading({ [address]: true });
    return new Promise((resolve) => {
      getTokenMeta(address)
        .then((res) => {
          const holders = res?.data?.holder || 0;
          setMemesListHolders({ [address]: holders });
          resolve(holders);
        })
        .catch((err) => {
          resolve(void 0);
          console.log("get meme holders queue err: %o", err);
        })
        .finally(() => {
          setHoldersLoading(false);
          setMemesListHoldersLoading({ [address]: false });
          spliceMemesHoldersQueue(0);
        });
    });
  };

  const getPoolToken = async (token: Hot) => {
    try {
      // console.log('%ctrends getPoolToken programId_address: %o', 'background:#FF2681;color:#fff;', programId_address);
      const programId = new PublicKey(programId_address);
      const state = PublicKey.findProgramAddressSync(
        [Buffer.from("launchpad")],
        programId
      );
      const pool = PublicKey.findProgramAddressSync(
        [
          Buffer.from("token_info"),
          state[0].toBuffer(),
          Buffer.from(token.token_name),
          Buffer.from(token.token_symbol)
        ],
        programId
      );
      if (!pool?.length) {
        // console.log('%ctrends getPoolToken no pool, will return 0 amount', 'background:#FF2681;color:#fff;');
        return {
          poolAmount: Big(0),
          solAmount: Big(0)
        };
      }
      const program = new Program<any>(idl, programId, {
        connection: connection
      } as any);
      const poolData: any = await program.account.pool.fetch(pool[0]);
      const poolToken = Big(poolData!.virtualTokenAmount.toNumber());
      const solToken = Big(poolData!.virtualWsolAmount.toNumber());
      // console.log(
      //   '%ctrends [%s] result: pool data=%o, pool token amount=%o, sol token amount=%o',
      //   'background:#FF2681;color:#fff;',
      //   token?.token_symbol,
      //   poolData,
      //   poolToken?.toString?.(),
      //   solToken?.toString?.(),
      // );
      return {
        poolAmount: poolToken,
        solAmount: solToken
      };
    } catch (err) {
      console.log(
        "%ctrends getPoolToken failed: %o",
        "background:#FF2681;color:#fff;",
        err
      );
      return {
        poolAmount: Big(0),
        solAmount: Big(0)
      };
    }
  };

  const formatHotList = async (_list: Hot[] = []) => {
    _list = Array.isArray(_list) ? _list : [];
    for (let i = 0; i < _list.length; i++) {
      const it = _list[i];
      it.kind = "Hot";
      it.created2Now = timeAgo(
        new Date(it.project_created).getTime(),
        new Date().getTime()
      );

      setMemesHoldersQueue(it.address);

      if ([0].includes(it.status)) {
        const { poolAmount, solAmount } = await getPoolToken(it);
        let _progress = Big(1095840542120770)
          .minus(poolAmount)
          .div(Big(1095840542120770).minus(295840542120770))
          .times(100);
        if (Big(_progress).lt(0)) {
          _progress = Big(0);
        }
        if (Big(_progress).gt(100)) {
          _progress = Big(100);
        }
        it.progress = _progress.toFixed(2, Big.roundDown);
        it.poolAmount = poolAmount;
        it.solAmount = solAmount;
      }

      // get k-line data
      if (![0].includes(it.status) && i < 3) {
        const kLineRes = await fetchData(
          it.address,
          getGranularityByResolution("1H"),
          0
        );
        it.kLineData = kLineRes.data.map(([timestamp, open]: any) => ({
          timestamp: timestamp,
          price: parseFloat(open)
        }));
      }
    }
    return _list;
  };

  const getHotList = async () => {
    setHotListLoading(true);
    try {
      const res = await httpGet(`/project/trends/list`, {
        // ⚠️ Trends page is no longer paginated, all data is returned at once
        // https://s3.cn-north-1.amazonaws.com.cn/lcpublic/185dc2d5-3cd5-40b5-9957-f1f95e47ca08_1200_8000?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAR4LOV33FDQFAFDV4%2F20250106%2Fcn-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250106T130658Z&X-Amz-Expires=10800&X-Amz-Signature=18fe496af343275074fcf0925e3f38102e99a5685e1be029f77b837a17a7490e&X-Amz-SignedHeaders=host&x-id=GetObject
        limit: 100,
        offset: 0,
        text: "",
        order: ""
      });

      const _hot_list = await formatHotList(res.data.list);

      setHotList(_hot_list);
      setHotListLoading(false);
    } catch (err) {
      console.log("get hot list err: %o", err);
      setHotListLoading(false);
    }
  };

  const formatMemesList = async (_list: Meme[] = [], tabType: any) => {
    _list = Array.isArray(_list) ? _list : [];
    for (let i = 0; i < _list.length; i++) {
      const it = _list[i];
      it.kind = "Meme";
      it.created2Now = timeAgo(it.DApp === "pump" ? it.time : it.created_at);

      setMemesHoldersQueue(it.address);

      if (memesListCountdown[it.id] !== void 0 && tabType === "import") {
        it.countdown = memesListCountdown[it.id];
      }
    }
    return _list;
  };

  const getMemesList = async (params?: MemesListParams) => {
    setMemesListLoading(true);
    const {
      offset = memesListPageOffset,
      order = memesListSortDirection,
      sort = memesListSortDataIndex,
      type = currentTab.type,
      auth,
      query_dApp = memesListPlatform.label,
      search = trim(memesListSearchText),
    } = params ?? {};

    const _getMinId = () => {
      let _mim_id: any = void 0;
      switch (type) {
        // Genesis
        case MemePhase.All:
          _mim_id = minBy(memesAllList, "id")?.id;
          break;
        // Genesis
        case MemePhase.New:
          _mim_id = minBy(memesGenesisList, "id")?.id;
          break;
        // Ticking
        case MemePhase.Bonding:
          _mim_id = minBy(memesTickingList, "id")?.id;
          break;
        // Listed
        case MemePhase.Listed:
          _mim_id = minBy(memesListedList, "id")?.id;
          break;
        //#region 👇Useless anymore
        // Import
        // case TABS[4].value:
        //   _mim_id = minBy(memesImportList, "id")?.id;
        //   break;
        // case 'pump':
        //   _mim_id = minBy(memesImportList, "id")?.id;
        //   break;
        // case 'gofund':
        //   _mim_id = minBy(memesImportList, "id")?.id;
        //   break;
        //#endregion 👆
        default:
          break;
      }
      return _mim_id;
    };

    try {
      const memesListParams: Record<string, any> = {
        limit: memesListPageLimit,
        offset: offset * memesListPageLimit,
        order,
        sort,
        type,
        query_dApp,
      };

      if (offset !== 0) {
        memesListParams.min_id = _getMinId();
      }
      if (!memesListParams.min_id) {
        delete memesListParams.min_id;
      }
      if (search) {
        memesListParams.test = search;
      }

      let res: any;
      if (auth) {
        res = await httpAuthGet(`/project/memes/list`, memesListParams);
      } else {
        res = await httpGet(`/project/memes/list`, memesListParams);
      }

      const _memes_list = await formatMemesList(res.data.list, type);

      const _setMemesList = (val: any) => {
        switch (type) {
          // All
          case MemePhaseType.All:
            setMemesAllList(val);
            break;
          // Genesis
          case MemePhaseType.New:
            setMemesGenesisList(val);
            break;
          // Ticking
          case MemePhaseType.Bonding:
            setMemesTickingList(val);
            break;
          // Listed
          case MemePhaseType.Listed:
            setMemesListedList(val);
            break;
          //#region 👇Useless anymore
          // Import
          // case TABS[4].value:
          //   setMemesImportList(val);
          //   break;
          // case 'pump':
          //   setMemesImportList(val);
          //   break;
          // case 'gofund':
          //   setMemesImportList(val);
          //   break;
          //#endregion 👆
          default:
            break;
        }
      };

      if (offset === 0) {
        _setMemesList(_memes_list);
      } else {
        const _list = [..._currentMemesList(type), ..._memes_list];
        _setMemesList(_list);
      }

      setMemesListPageNext(res.data.has_next_page);
      setMemesListPageOffset(offset);
      setMemesListLoading(false);
    } catch (err) {
      console.log("get memes list err: %o", err);
      setMemesListLoading(false);
    }
  };
  const { run: getMemesListDelay } = useDebounceFn(getMemesList, { wait: 1000 });

  const { run: onMemesListNextPage } = useThrottleFn(
    () => {
      if (memesListLoading || !memesListPageNext) return;
      getMemesList({
        offset: memesListPageOffset + 1,
        type: currentTab.type
      });
    },
    { wait: 1000 }
  );

  const initMemesList = () => {
    setMemesGenesisList([]);
    setMemesTickingList([]);
    setMemesListedList([]);
    setMemesImportList([]);
    setMemesListPageNext(true);
    setMemesListPageOffset(0);
    setMemesListLoading(false);
  };

  useEffect(() => {
    if (!isLoadData) return;

    getHotList();
  }, [isLoadData]);

  useEffect(() => {
    if (!isLoadData) return;

    getMemesListDelay({
      auth: address && accountRefresher,
      type: currentTab.type
    });
  }, [isLoadData, address, accountRefresher]);

  useEffect(() => {
    if (holdersLoading) return;
    const curr = memesHoldersQueue[0];
    if (curr) {
      getMemeHolders(curr);
    }
  }, [memesHoldersQueue, holdersLoading, connection]);

  return {
    hotList,
    list: listShown,
    getHotList,
    getMemesList,
    getMemesListDelay,
    hotListLoading,
    memesListLoading,
    currentTab,
    setCurrentTab,
    memesListPageNext,
    onMemesListNextPage,
    initMemesList,
    memesContainerRef,
    setMemesListCountdown,
    memesListHolders,
    memesListHoldersLoading,
    memesListPageOffset,
    setMemesListPageOffset,

    memesListSortDataIndex,
    memesListSortDirection,
    memesListPlatform,
    setMemesListSortDataIndex,
    setMemesListSortDirection,
    setMemesListPlatform,
    memesListSearchText,
    setMemesListSearchText,
  };
}

interface MemesListParams {
  offset?: number;
  order?: GridTableSortDirection;
  sort?: string;
  type?: string;
  auth?: boolean;
  query_dApp?: MemePlatform;
  search?: string;
}

export interface Memes extends MemesState {
  hotList: Hot[];
  list: Hot[] | Meme[];
  getHotList(): Promise<void>;
  getMemesList: (params?: (MemesListParams | undefined)) => Promise<void>;
  getMemesListDelay: DebouncedFunc<(params?: (MemesListParams | undefined)) => Promise<void>>;
  hotListLoading: boolean;
  memesListLoading: boolean;
  memesListPageNext: boolean;
  onMemesListNextPage: () => void;
  initMemesList: () => void;
  memesContainerRef: React.MutableRefObject<any>;
  setMemesListCountdown: (obj: Record<string, number>) => void;
  memesListHolders: Record<string, number>;
  memesListHoldersLoading: Record<string, boolean>;
  memesListPageOffset: number;
  setMemesListPageOffset: (offset: number) => void;

  memesListSortDataIndex: MemeSort;
  memesListSortDirection: GridTableSortDirection;
  memesListPlatform: MemePlatformItem;
  setMemesListSortDataIndex: (sort: MemeSort) => void;
  setMemesListSortDirection: (direction: GridTableSortDirection) => void;
  setMemesListPlatform: (platform: MemePlatformItem) => void;
  memesListSearchText: string;
  setMemesListSearchText: (searchText: string) => void;
}

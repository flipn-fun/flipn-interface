import styles from './index.module.css';
import { MemePhase, MemePhases, MemePlatforms, MemeSort, Order } from '@/app/sections/memes/config';
import GridTable, { GridTableSortDirection } from '@/app/components/grid-table';
import { useContext, useMemo, useState } from 'react';
import { useUserAgent } from '@/app/context/user-agent';
import { MemesContext } from '@/app/sections/memes/context';
import { trim } from 'lodash-es';
import FallbackImg from '@/app/components/fallback-img';
import { formatLongText, numberFormatter } from '@/app/utils/common';
import { motion } from 'framer-motion';
import Big from 'big.js';
import Loading from '@/app/components/icons/loading';
import { actionLikeTrigger } from '@/app/components/timesLike/ActionTrigger';
import SexInfiniteScroll from '@/app/components/sexInfiniteScroll';
import { useRouter } from 'next/navigation';

const MemesContent = (props: any) => {
  const { } = props;

  const { isMobile } = useUserAgent();
  const {
    memesListLoading,
    memesListPageNext,
    onMemesListNextPage,
    initMemesList,
    list,
    currentTab,
    setCurrentTab,
    getMemesList,
    memesListSortDataIndex,
    memesListSortDirection,
    memesListPlatform,
    setMemesListSortDataIndex,
    setMemesListSortDirection,
    setMemesListPlatform,
    memesListSearchText,
    setMemesListSearchText,
    getMemesListDelay,
    memesListHolders,
    memesListHoldersLoading,
  } = useContext(MemesContext);
  const router = useRouter();

  const onDetail = (record: any) => {
    const { address } = record;
    router.push(`/detail?address=${address}&from=memes`);
  };

  const columns = [
    {
      key: "favorite",
      dataIndex: "favorite",
      title: "",
      width: 30,
      render: (record: any) => {
        return (
          <Favorite record={record} />
        );
      },
    },
    {
      key: "token",
      dataIndex: "token",
      title: "Token",
      width: "2fr",
      render: (record: any) => {
        const currPlatform = Object.values(MemePlatforms).find((p) => p.dApp.includes(record.DApp));
        return (
          <div className={styles.MemesTableToken}>
            <FallbackImg
              src={record.icon}
              alt=""
              className={styles.MemesTableTokenIcon}
              onClick={() => onDetail(record)}
            />
            <div className={styles.MemesTableTokenInfo}>
              <div className={styles.MemesTableTokenSymbolWrap}>
                <div
                  className={styles.MemesTableTokenSymbol}
                  onClick={() => onDetail(record)}
                >
                  {record.token_symbol}
                </div>
                <FallbackImg
                  src={currPlatform?.icon}
                  alt=""
                  className={styles.MemesTableTokenPlatform}
                />
              </div>
              <div
                className={styles.MemesTableTokenAddress}
                onClick={() => onDetail(record)}
              >
                {formatLongText(record.address, 5, 5)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "platform",
      dataIndex: "platform",
      width: "1fr",
      title: "Platform",
      render: (record: any) => {
        const currPlatform = Object.values(MemePlatforms).find((p) => p.dApp.includes(record.DApp));

        return currPlatform?.label ?? record.DApp;
      },
    },
    {
      key: "age",
      dataIndex: "latest",
      width: "1fr",
      title: "Age",
      sort: true,
      ellipsis: true,
      render: (record: any) => {
        return record.created2Now;
      },
    },
    {
      key: "phase",
      dataIndex: "phase",
      width: "1fr",
      title: "Phase",
      render: (record: any) => {
        const { status } = record;
        const currPhase = Object.values(MemePhases).find((p) => p.status === status);

        if (status === MemePhases[MemePhase.New].status) {
          return (
            <div className={styles.MemesTablePhase}>
              <div className={styles.MemesTablePhaseValue}>
                {record.bonding_progress}%
              </div>
              <div className={styles.MemesTablePhaseProgress}>
                <motion.div
                  className={styles.MemesTablePhaseProgressValue}
                  initial={{ x: "-100%" }}
                  animate={{ x: `-${Big(100).minus(record.bonding_progress).toFixed(2, Big.roundDown)}%` }}
                />
              </div>
            </div>
          );
        }

        return (
          <div className={styles.MemesTablePhaseValueListed}>
            {currPhase?.label}
          </div>
        );
      },
    },
    {
      key: "liq",
      dataIndex: "liq",
      width: "1fr",
      title: "Liq",
      sort: true,
    },
    {
      key: "volume",
      dataIndex: "volume",
      width: "1fr",
      title: "Volume",
      sort: true,
      render: (record: any) => {
        return numberFormatter(record.volume, 2, true, { isShort: true, isShortUppercase: true });
      },
    },
    {
      key: "marketCap",
      dataIndex: "mcap",
      width: "1fr",
      title: "Market Cap",
      sort: true,
      render: (record: any) => {
        return numberFormatter(record.market_cap, 2, true, { isShort: true, isShortUppercase: true });
      },
    },
    {
      key: "holders",
      dataIndex: "holders",
      width: "1fr",
      title: "Holders",
      sort: true,
      render: (record: any) => {
        if (memesListHoldersLoading?.[record.address]) {
          return (
            <Loading size={12} />
          );
        }
        return numberFormatter(record.holders, 0, true, { isShort: true, isShortUppercase: true });
      },
    },
  ];

  const shownList = useMemo(() => {
    if (!list) return [];
    return list.map((item: any) => {
      item.holders = memesListHolders?.[item.address] ?? "0";
      return item;
    });
  }, [list, memesListHolders]);

  return (
    <div className={styles.MemesContentContainer}>
      <div className={styles.MemesFilters}>
        <div className={styles.MemesFiltersLeft}>
          <div className={styles.MemesPlatforms}>
            {
              Object.values(MemePlatforms).map((item, index) => (
                <button
                  type="button"
                  key={index}
                  className={memesListPlatform?.value === item.value ? styles.MemesPlatformActive : styles.MemesPlatform}
                  disabled={memesListLoading}
                  onClick={() => {
                    setMemesListPlatform?.(item);
                    initMemesList?.();
                    getMemesList?.({
                      query_dApp: item.value,
                      offset: 0,
                    });
                  }}
                >
                  <img src={item.icon} alt="" className={styles.MemesPlatformIcon} />
                  <div className={styles.MemesPlatformLabel}>
                    {item.label}
                  </div>
                </button>
              ))
            }
          </div>
          <div className={styles.MemesPhases}>
            {
              Object.values(MemePhases).map((item, index) => (
                <button
                  type="button"
                  disabled={memesListLoading}
                  key={index}
                  className={currentTab?.value === item.value ? styles.MemesPhaseActive : styles.MemesPhase}
                  onClick={() => {
                    setCurrentTab?.(item);
                    initMemesList?.();
                    getMemesList?.({
                      type: item.type,
                      offset: 0,
                    });
                  }}
                >
                  <div className={styles.MemesPhaseLabel}>
                    {item.label}
                  </div>
                </button>
              ))
            }
          </div>
        </div>
        <div className={styles.MemesFiltersRight}>
          <div className={styles.MemesSearch}>
            <img src="/img/memes/icon-search.svg" className={styles.MemesSearchIcon} />
            <input
              type="text"
              className={styles.MemesSearchInput}
              placeholder=""
              value={memesListSearchText}
              onChange={(e) => {
                setMemesListSearchText?.(e.target.value);
                initMemesList?.();
                getMemesListDelay?.({
                  search: trim(e.target.value),
                  offset: 0,
                });
              }}
            />
            {
              trim(memesListSearchText) && (
                <button
                  type="button"
                  className={styles.MemesSearchClear}
                  onClick={() => {
                    setMemesListSearchText?.('');
                    initMemesList?.();
                    getMemesList?.({
                      offset: 0,
                    });
                  }}
                />
              )
            }
          </div>
        </div>
      </div>
      <GridTable
        className={styles.MemesTable}
        columns={columns}
        data={shownList}
        loading={shownList.length <= 0 ? memesListLoading : false}
        sortDataIndex={memesListSortDataIndex}
        sortDirection={memesListSortDirection}
        onSort={(dataIndex: string, direction: GridTableSortDirection)  => {
          setMemesListSortDataIndex?.(dataIndex as MemeSort);
          setMemesListSortDirection?.(direction);
          getMemesList?.({
            order: direction,
            sort: dataIndex,
          });
        }}
      />
      <SexInfiniteScroll
        loadMore={onMemesListNextPage}
        hasMore={memesListPageNext}
        noMoreContent={shownList.length > 0 ? (
          <div className={styles.MemesTableNoMore}>No more memes</div>
        ) : null}
      />
    </div>
  );
};

export default MemesContent;

const Favorite = (props: any) => {
  const { record } = props;

  const [pending, setPending] = useState(false);
  const [isLike, setIsLike] = useState(record.is_like);

  let favoriteIconStyles: any = {
    stroke: "white",
    strokeOpacity: 0.6,
  };
  if (isLike) {
    favoriteIconStyles = {
      fill: "white",
      fillOpacity: 0.6,
    };
  }

  return (
    <button
      type="button"
      disabled={pending || isLike}
      onClick={async () => {
        if (!window.sexAddress) {
          window.connect();
          return;
        }
        setPending(true);
        const res = await actionLikeTrigger({
          data: record,
        });
        if (res) {
          setIsLike(true);
        }
        setPending(false);
      }}
      className={styles.MemesTableFavorite}
    >
      {
        pending ? (
          <Loading size={14} />
        ) : (
          <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 0L12.9624 5.92255L19.5106 6.90983L14.7933 11.5574L15.8779 18.0902L10 15.04L4.12215 18.0902L5.20668 11.5574L0.489435 6.90983L7.03756 5.92255L10 0Z"
              {...favoriteIconStyles}
            />
          </svg>
        )
      }
    </button>
  );
};

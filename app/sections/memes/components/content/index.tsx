import styles from './index.module.css';
import {
  MemePhase,
  MemePhases,
  MemePlatform,
  MemePlatforms,
  MemeSort,
  MemeSortOptions,
  Order
} from '@/app/sections/memes/config';
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
import Search from '@/app/sections/memes/components/content/search';
import MemesSelect from '@/app/sections/memes/components/select';
import List from '@/app/sections/memes/components/content/list';
import Favorite from '@/app/sections/memes/components/content/favorite';
import useSolPrice from '@/app/hooks/use-sol-price';

const MemesContent = (props: any) => {
  const { } = props;

  const { isMobile } = useUserAgent();
  const { solPrice } = useSolPrice();
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
        const currPlatform = Object.values(MemePlatforms).find((p) => {
          return p.dApp.some((reg) => reg.test(record.DApp));
        });

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
      width: "124px",
      title: "Platform",
      ellipsis: true,
      render: (record: any) => {
        const currPlatform = Object.values(MemePlatforms).find((p) => {
          return p.dApp.some((reg) => reg.test(record.DApp));
        });

        return currPlatform?.label ?? record.DApp;
      },
    },
    {
      key: "age",
      dataIndex: "latest",
      width: "150px",
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
      width: "124px",
      title: "Phase",
      ellipsis: true,
      render: (record: any) => {
        const { status } = record;
        const currPhase = Object.values(MemePhases).find((p) => p.status === status);

        if (
          Big(record.bonding_progress || 0).lte(100)
          && Big(record.bonding_progress || 0).gte(0)
          && status !== MemePhases[MemePhase.Listed].status
        ) {
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
    // {
    //   key: "liq",
    //   dataIndex: "liq",
    //   width: "1fr",
    //   title: "Liq",
    //   sort: true,
    // },
    {
      key: "volume",
      dataIndex: "volume",
      width: "124px",
      title: "Volume",
      sort: true,
      ellipsis: true,
      render: (record: any) => {
        return numberFormatter(Big(record.volume || 0).times(solPrice || 0), 2, true, { prefix: "$", isShort: true, isShortUppercase: true });
      },
    },
    {
      key: "marketCap",
      dataIndex: "mcap",
      width: "124px",
      title: "Market Cap",
      ellipsis: true,
      sort: true,
      render: (record: any) => {
        return numberFormatter(record.market_cap, 2, true, { prefix: "$", isShort: true, isShortUppercase: true });
      },
    },
    {
      key: "holders",
      dataIndex: "holders",
      width: "124px",
      title: "Holders",
      ellipsis: true,
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

  const handleSort = (dataIndex: string, direction: GridTableSortDirection)  => {
    setMemesListSortDataIndex?.(dataIndex as MemeSort);
    setMemesListSortDirection?.(direction);
    getMemesList?.({
      offset: 0,
      order: direction,
      sort: dataIndex,
    });
  };

  return (
    <div className={isMobile ? styles.MemesContentContainerMobile : styles.MemesContentContainer}>
      <div className={isMobile ? styles.MemesFiltersMobile : styles.MemesFilters}>
        <div className={isMobile ? styles.MemesFiltersLeftMobile : styles.MemesFiltersLeft}>
          <div className={isMobile ? styles.MemesPlatformsMobile : styles.MemesPlatforms}>
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
          <div className={isMobile ? styles.MemesPhasesMobile : styles.MemesPhases}>
            {
              isMobile && (
                <Search
                  width={28}
                  loading={memesListLoading}
                  searchText={memesListSearchText}
                  onChange={(val: string) => {
                    setMemesListSearchText?.(val);
                    initMemesList?.();
                    getMemesList?.({
                      search: trim(val),
                      offset: 0,
                    });
                  }}
                />
              )
            }
            <div className={isMobile ? styles.MemesPhasesListMobile : styles.MemesPhasesList}>
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
            {
              isMobile && (
                <MemesSelect
                  className={styles.MemesFiltersOrderMobile}
                  containerClassName={styles.MemesFiltersOrderContainerMobile}
                  value={memesListSortDataIndex}
                  loading={memesListLoading}
                  onChange={(option: any) => {
                    if (memesListLoading) return;
                    let nextDirection = memesListSortDirection === GridTableSortDirection.Asc ? GridTableSortDirection.Desc : GridTableSortDirection.Asc;
                    if (option.value !== memesListSortDataIndex) {
                      nextDirection = GridTableSortDirection.Asc;
                    }
                    setMemesListSortDataIndex?.(option.value as MemeSort);
                    setMemesListSortDirection?.(nextDirection);
                    getMemesList?.({
                      offset: 0,
                      order: nextDirection,
                      sort: option.value,
                    });
                  }}
                  options={Object.values(MemeSortOptions)}
                  renderSelectedLabel={(option: any) => {
                    return (
                      <div className={styles.MemesFiltersOrderSelectedLabel}>
                        <div
                          className={memesListSortDirection === GridTableSortDirection.Asc ? styles.MemesFiltersOrderSelectedLabelDirection : styles.MemesFiltersOrderSelectedLabelDirectionUp}
                        />
                        <div className={styles.MemesFiltersOrderSelectedLabelValue}>
                          {option.label}
                        </div>
                      </div>
                    );
                  }}
                />
              )
            }
          </div>
        </div>
        {
          !isMobile && (
            <div className={styles.MemesFiltersRight}>
              <Search
                searchText={memesListSearchText}
                loading={memesListLoading}
                onChange={(val: string) => {
                  setMemesListSearchText?.(val);
                  initMemesList?.();
                  getMemesList?.({
                    search: trim(val),
                    offset: 0,
                  });
                }}
              />
            </div>
          )
        }
      </div>
      <div className={styles.MemesListContainer}>
        {
          isMobile ? (
            <List
              data={shownList}
              loading={shownList.length <= 0 ? memesListLoading : false}
              onDetail={onDetail}
              memesListHoldersLoading={memesListHoldersLoading}
            />
          ) : (
            <GridTable
              className={styles.MemesTable}
              columns={columns}
              data={shownList}
              loading={shownList.length <= 0 ? memesListLoading : false}
              sortDataIndex={memesListSortDataIndex}
              sortDirection={memesListSortDirection}
              onSort={handleSort}
            />
          )
        }
      </div>
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

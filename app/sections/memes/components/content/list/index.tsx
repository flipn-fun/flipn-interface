import styles from './index.module.css';
import clsx from 'clsx';
import Loading from '@/app/components/icons/loading';
import Empty from '@/app/components/empty';
import Favorite from '@/app/sections/memes/components/content/favorite';
import FallbackImg from '@/app/components/fallback-img';
import { formatLongText, numberFormatter } from '@/app/utils/common';
import { MemePhase, MemePhases, MemePlatforms } from '@/app/sections/memes/config';
import Big from 'big.js';
import { motion } from 'framer-motion';

const List = (props: any) => {
  const { className, data, loading, onDetail, memesListHoldersLoading } = props;

  return (
    <div className={clsx(styles.ListContainer, className)}>
      {
        loading ? (
          <div className={styles.ListLoading}>
            <Loading size={16} />
          </div>
        ) : (
          data.length > 0 ? data.map((record: any, index: number) => (
            <Record
              key={index}
              record={record}
              onDetail={onDetail}
              memesListHoldersLoading={memesListHoldersLoading}
            />
          )) : (
            <div className={styles.ListLoading}>
              <Empty text="No memes" />
            </div>
          )
        )
      }
    </div>
  );
};

export default List;

const Record = (props: any) => {
  const { record, onDetail, memesListHoldersLoading } = props;

  const { status } = record;

  const currPlatform = Object.values(MemePlatforms).find((p) => {
    return p.dApp.some((reg) => reg.test(record.DApp));
  });
  const currPhase = Object.values(MemePhases).find((p) => p.status === status);

  return (
    <div className={styles.ListRecord}>
      <div className={styles.ListRecordLeft}>
        <Favorite record={record} />
        <FallbackImg
          src={record.icon}
          alt=""
          className={styles.ListRecordIcon}
          onClick={() => onDetail(record)}
        />
      </div>
      <div className={styles.ListRecordRight}>
        <div className={styles.ListRecordRightInfo}>
          <div className={styles.ListRecordName}>
            <div
              className={styles.ListRecordSymbol}
              onClick={() => onDetail(record)}
            >
              {formatLongText(record.token_symbol, 5, 5)}
            </div>
            {/*<div className={styles.ListRecordKing}>
             👑
             </div>*/}
            <FallbackImg
              src={currPlatform?.icon}
              alt=""
              className={styles.ListRecordPlatformIcon}
            />
          </div>
          <div className={styles.ListRecordMC}>
            MC {numberFormatter(record.market_cap, 2, true, { prefix: "$", isShort: true, isShortUppercase: true })}
          </div>
        </div>
        <div className={styles.ListRecordAddressWrap}>
          <div className={styles.ListRecordAddress}>
            {formatLongText(record.address, 4, 5)}
          </div>
          <div className={styles.ListRecordAge}>
            {record.created2Now}
          </div>
        </div>
        <div className={styles.ListRecordSummaries}>
          {/*<LabelValue label="Liq">
            -
          </LabelValue>*/}
          <LabelValue label="Vol">
            {numberFormatter(record.volume, 2, true, { prefix: "$", isShort: true, isShortUppercase: true })}
          </LabelValue>
          <LabelValue label={(
            <img src="/img/memes/icon-holders.svg" alt="" className={styles.IconHolders} />
          )}>
            {
              memesListHoldersLoading?.[record.address] ? (
                <Loading size={12} />
              ) : numberFormatter(record.holders, 0, true, { isShort: true, isShortUppercase: true })
            }
          </LabelValue>
        </div>
        {
          (
            Big(record.bonding_progress || 0).lt(100)
            && Big(record.bonding_progress || 0).gte(0)
            && status !== MemePhases[MemePhase.Listed].status
          ) && (
            <div className={styles.ListRecordProgress}>
              <motion.div
                className={styles.ListRecordProgressValue}
                initial={{ x: "-100%" }}
                animate={{ x: `-${Big(100).minus(record.bonding_progress).toFixed(2, Big.roundDown)}%` }}
              />
            </div>
          )
        }
      </div>
    </div>
  );
};

const LabelValue = (props: any) => {
  const { label, children, className, labelClassName, valueClassName } = props;

  return (
    <div className={clsx(styles.LabelValueContainer, className)}>
      <div className={clsx(styles.LabelValueLabel, labelClassName)}>
        {label}
      </div>
      <div className={clsx(styles.LabelValueValue, valueClassName)}>
        {children}
      </div>
    </div>
  );
};

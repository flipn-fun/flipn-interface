import styles from './index.module.css';
import clsx from 'clsx';
import Loading from '@/app/components/icons/loading';
import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { httpAuthDelete, httpAuthPost } from '@/app/utils';
import { fail, success } from '@/app/utils/toast';

const Favorite = (props: any) => {
  const { record, className, onSuccess } = props;

  const [isCollected, setIsCollected] = useState(false);

  let favoriteIconStyles: any = {
    stroke: "white",
    strokeOpacity: 0.6,
  };
  if (isCollected) {
    favoriteIconStyles = {
      fill: "white",
      fillOpacity: 0.6,
    };
  }

  const { runAsync: onCollect, loading: collectLoading } = useRequest(async () => {
    let res;
    if (isCollected) {
      res = await httpAuthDelete('/project/collect?id=' + record.id);
    } else {
      res = await httpAuthPost('/project/collect?id=' + record.id);
    }
    if (res) {
      onSuccess?.("collect");
      setIsCollected(!isCollected);
      success(isCollected ? 'Successfully canceled' : 'Successfully collected');
    } else {
      fail(isCollected ? 'Collection canceled failed' : 'Collection failed');
    }
  }, { manual: true, throttleWait: 1000 });

  useEffect(() => {
    setIsCollected(record.is_collect);
  }, [record]);

  return (
    <button
      type="button"
      disabled={collectLoading}
      onClick={() => {
        if (!window.sexAddress) {
          window.connect();
          return;
        }
        onCollect();
      }}
      className={clsx(styles.MemesTableFavorite, className)}
    >
      {
        collectLoading ? (
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

export default Favorite;
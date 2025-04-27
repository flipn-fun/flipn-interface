import styles from './index.module.css';
import clsx from 'clsx';
import Loading from '@/app/components/icons/loading';
import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { httpAuthDelete, httpAuthPost } from '@/app/utils';
import { fail, success } from '@/app/utils/toast';
import { motion } from 'framer-motion';

const Favorite = (props: any) => {
  const { record, className, onSuccess } = props;

  const [isCollected, setIsCollected] = useState(false);

  let favoriteIconStyles: any = {
    fill: "white",
  };
  if (isCollected) {
    favoriteIconStyles = {
      fill: "#FBCA04",
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
          <motion.svg width="38" height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_11078_218)">
              <motion.path
                d="M19 4L23.4437 12.8838L33.2658 14.3647L26.19 21.3362L27.8168 31.1353L19 26.56L10.1832 31.1353L11.81 21.3362L4.73415 14.3647L14.5563 12.8838L19 4Z"
                animate={favoriteIconStyles}
              />
            </g>
            <defs>
              <filter id="filter0_d_11078_218" x="0.734375" y="0" width="36.5312" height="35.1353" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_11078_218"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_11078_218" result="shape"/>
              </filter>
            </defs>
          </motion.svg>
        )
      }
    </button>
  );
};

export default Favorite;
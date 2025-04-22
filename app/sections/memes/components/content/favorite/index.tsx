import styles from './index.module.css';
import clsx from 'clsx';
import Loading from '@/app/components/icons/loading';
import { useState } from 'react';
import { actionLikeTrigger } from '@/app/components/timesLike/ActionTrigger';

const Favorite = (props: any) => {
  const { record, className } = props;

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
      className={clsx(styles.MemesTableFavorite, className)}
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

export default Favorite;
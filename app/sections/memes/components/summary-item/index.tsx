import styles from './index.module.css';
import clsx from 'clsx';
import { numberFormatter } from '@/app/utils/common';
import {
  IconFlip,
  IconLike,
  IconPlane,
  IconRocket,
  IconUser
} from '@/app/sections/memes/components/summary-item/icons';
import Loading from '@/app/components/icons/loading';

const SummaryItem = (props: any) => {
  const { className, type, value, loading } = props;

  const Icon = Config[type].icon;

  return (
    <div className={clsx(styles.SummaryItemContainer, className)}>
      <Icon className="icon" />
      <div className="text">
        {
          loading ? (
            <Loading size={10} />
          ) : numberFormatter(value, 1, true, { isShort: true, isShortUppercase: true })
        }
      </div>
    </div>
  );
};

export default SummaryItem;

const Config: any = {
  rocket: {
    icon: IconRocket
  },
  user: {
    icon: IconUser
  },
  plane: {
    icon: IconPlane
  },
  like: {
    icon: IconLike
  },
  flip: {
    icon: IconFlip
  },
};

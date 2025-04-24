import clsx from 'clsx';
import { PAGINATION_ACTION } from './config';
import PaginationItem from '@/app/components/pagination/item';
import styles from './index.module.css';

const Pagination = (props: any) => {
  const { className, pageTotal, pageIndex, onChange, loading, isNext } = props;

  return (
    <div className={clsx(styles.Pagination, className)}>
      <PaginationItem
        icon="/img/memes/page-first.svg"
        disabled={loading || pageIndex <= 1}
        onClick={() => {
          onChange(1, PAGINATION_ACTION.FIRST);
        }}
      />
      <PaginationItem
        icon="/img/memes/page-prev.svg"
        disabled={loading || pageIndex <= 1}
        onClick={() => {
          onChange(pageIndex - 1, PAGINATION_ACTION.PREV);
        }}
      />
      <div className={styles.PaginationContent}>
        <div className="">{pageIndex}</div>
        {
          !!pageTotal && (
            <>
              <div className="">/</div>
              <div className="">{pageTotal}</div>
            </>
          )
        }
      </div>
      <PaginationItem
        icon="/img/memes/page-next.svg"
        disabled={loading || !!pageTotal ? pageIndex >= pageTotal : !isNext}
        onClick={() => {
          onChange(pageIndex + 1, PAGINATION_ACTION.NEXT);
        }}
      />
      {
        !!pageTotal && (
          <PaginationItem
            icon="/img/memes/page-last.svg"
            disabled={loading || pageIndex >= pageTotal}
            onClick={() => {
              onChange(pageTotal, PAGINATION_ACTION.LAST);
            }}
          />
        )
      }
    </div>
  );
};

export default Pagination;

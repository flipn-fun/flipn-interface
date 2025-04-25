import styles from "./index.module.css";
import clsx from "clsx";
import React, { useImperativeHandle, useMemo } from 'react';
import Loading from '@/app/components/icons/loading';
import Empty from '@/app/components/empty';

const GridTable = (props: Props, ref: any) => {
  const {
    data = [],
    columns,
    className,
    headerClassName,
    bodyClassName,
    rowClassName,
    headerRowClassName,
    bodyRowClassName,
    colClassName,
    headerColClassName,
    bodyColClassName,
    emptyClassName,
    sortDataIndex,
    sortDirection,
    onSort,
    loading,
  } = props;

  const [gridTemplateColumns] = useMemo(() => {
    return [
      columns.map((col: any) => {
        return col.width
          ? (
            typeof col.width === "number"
              ? `${col.width}px`
              : col.width
          )
          : "auto";
      }).join(' ')
    ];
  }, [columns]);

  const renderColStyles = (col: any, isBody?: boolean) => {
    const ellipsis: any = {};
    if (col.ellipsis) {
      ellipsis.overflow = "hidden";
      ellipsis.textOverflow = "ellipsis";
      ellipsis.whiteSpace = "nowrap";
    }
    return {
      textAlign: col.align || "left",
      justifyContent: col.align === "center"
        ? "center"
        : (
          col.align === "right"
            ? "flex-end"
            : "flex-start"
        ),
      cursor: (col.sort && !isBody) ? "pointer" : "default",
      ...ellipsis,
    };
  };

  const refs = {};
  useImperativeHandle(ref, () => refs);

  return (
    <div className={clsx(styles.GridTable, className)}>
      <div className={clsx(styles.GridTableHeader, headerClassName)}>
        <div
          className={clsx(styles.GridTableRow, styles.GridTableHeaderRow, rowClassName, headerRowClassName)}
          style={{
            gridTemplateColumns,
          }}
        >
          {
            columns.map((col: any, index: number) => (
              <div
                key={`grid-table-header-col-${index}`}
                className={clsx(styles.GridTableCol, styles.GridTableHeaderCol, colClassName, headerColClassName)}
                style={renderColStyles(col)}
                onClick={() => {
                  if (col.sort && !loading) {
                    let nextDirection = sortDirection === GridTableSortDirection.Asc ? GridTableSortDirection.Desc : GridTableSortDirection.Asc;
                    if (sortDataIndex !== col.dataIndex) {
                      nextDirection = GridTableSortDirection.Asc;
                    }
                    onSort?.(col.dataIndex, nextDirection);
                  }
                }}
              >
                {
                  typeof col.title === "function"
                    ? col.title(col, index)
                    : (
                      <div
                        className={clsx(styles.GridTableHeaderColInner, col.ellipsis && styles.GridTableBodyColEllipsis)}
                        title={(col.ellipsis && typeof col.title === "string") && col.title}
                      >
                        {col.title}
                      </div>
                    )
                }
                {
                  col.sort && (
                    <div className={styles.GridTableHeaderColSort}>
                      <svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M3.5 0L6.53109 3H0.468911L3.5 0Z"
                          fill={(sortDirection === GridTableSortDirection.Asc && sortDataIndex === col.dataIndex) ? "#FBCA04" : "white"}
                          fill-opacity={(sortDirection === GridTableSortDirection.Asc && sortDataIndex === col.dataIndex) ? 1 : 0.4}
                        />
                        <path
                          d="M3.5 10L6.53109 7H0.468911L3.5 10Z"
                          fill={(sortDirection === GridTableSortDirection.Desc && sortDataIndex === col.dataIndex) ? "#FBCA04" : "white"}
                          fill-opacity={(sortDirection === GridTableSortDirection.Desc && sortDataIndex === col.dataIndex) ? 1 : 0.4}
                        />
                      </svg>
                    </div>
                  )
                }
              </div>
            ))
          }
        </div>
      </div>
      <div className={clsx(styles.GridTableBody, bodyClassName)}>
        {
          loading ? (
            <div className={styles.GridTableLoading}>
              <Loading size={16} />
            </div>
          ) : (
            data?.length > 0 ? data.map((item: any, index: number) => (
              <div
                key={`grid-table-body-row-${index}`}
                className={clsx(styles.GridTableRow, styles.GridTableBodyRow, rowClassName, bodyRowClassName)}
                style={{
                  gridTemplateColumns,
                }}
              >
                {
                  columns.map((col: any, idx: number) => (
                    <div
                      key={`grid-table-body-col-${idx}`}
                      className={clsx(styles.GridTableCol, styles.GridTableBodyCol, colClassName, bodyColClassName)}
                      style={renderColStyles(col, true)}
                    >
                      {
                        typeof col.render === "function"
                          ? (
                            <div
                              className={clsx(styles.GridTableBodyColInner, col.ellipsis && styles.GridTableBodyColEllipsis)}
                              title={col.ellipsis && item[col.dataIndex]}
                            >
                              {col.render(item, index, col, idx)}
                            </div>
                          )
                          : (
                            <div
                              className={clsx(styles.GridTableBodyColInner, col.ellipsis && styles.GridTableBodyColEllipsis)}
                              title={col.ellipsis && item[col.dataIndex]}
                            >
                              {item[col.dataIndex]}
                            </div>
                          )
                      }
                    </div>
                  ))
                }
              </div>
            )) : (
              <div className={clsx(styles.GridTableEmpty, emptyClassName)}>
                <Empty text="No memes" />
              </div>
            )
          )
        }
      </div>
    </div>
  );
};

export default React.forwardRef<any, Props>(GridTable);

export interface Props {
  data?: Record<string, any>[];
  columns: {
    dataIndex: string;
    title: string | ((col: any, index: number) => any);
    align?: GridTableAlign;
    sort?: boolean;
    render?: (item: any, index: number, col: any, idx: number) => any;
    ellipsis?: boolean;
    width?: string | number;
  }[];
  loading?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string;
  headerRowClassName?: string;
  bodyRowClassName?: string;
  colClassName?: string;
  headerColClassName?: string;
  bodyColClassName?: string;
  emptyClassName?: string;
  sortDataIndex?: string;
  sortDirection?: GridTableSortDirection;
  onSort?: (dataIndex: string, direction: GridTableSortDirection) => void;
}

export enum GridTableAlign {
  Left = "left",
  Center = "center",
  Right = "right",
}

export enum GridTableSortDirection {
  Asc = "asc",
  Desc = "desc",
}

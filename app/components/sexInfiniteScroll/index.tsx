import { DotLoading, InfiniteScroll } from "antd-mobile";

const InfiniteScrollContent = ({ hasMore, noMoreContent }: { hasMore?: boolean; noMoreContent?: any; }) => {
  return (
    <>
      {hasMore ? (
        <div style={{ padding: "10px 0" }}>
          <span>Loading</span>
          <DotLoading />
        </div>
      ) : (
        <span>{noMoreContent}</span>
      )}
    </>
  );
};

export default function SexInfiniteScroll({ loadMore, hasMore, noMoreContent }: any) {
  return (
    <InfiniteScroll loadMore={loadMore} hasMore={hasMore} style={{ padding: 0 }}>
      <InfiniteScrollContent hasMore={hasMore} noMoreContent={noMoreContent} />
    </InfiniteScroll>
  );
}

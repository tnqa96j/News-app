import { Spinner } from "@/components/Spinner";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LoadMoreProps {
  // loadMoreRef: React.RefObject<HTMLDivElement>;
  isFetching: boolean;
  isLoading: boolean;
  hasMore: boolean;
  dataLength: number;
  onLoadMore: () => void;
  className?: string;
}

export default function LoadMore({
  isFetching,
  hasMore,
  isLoading,
  dataLength,
  onLoadMore,
  className,
}: LoadMoreProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 觸底加載：設置IntersectionObserver監聽器
  useEffect(() => {
    if (!hasMore || isFetching) return;

    let triggered = false; // 防止同一個 Observer 觸發兩次

    let ob: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || triggered) return;
        triggered = true;
        onLoadMore();
      },
    );

    const loadMoreBox = loadMoreRef.current;
    if (loadMoreRef.current) ob.observe(loadMoreRef.current);

    return () => {
      if (loadMoreBox) ob?.unobserve(loadMoreBox); // 這裡必須用loadMore，因為在元件釋放時loadMore.current=null
      ob = null;
    };
  }, [hasMore, isFetching]); // onLoadMore 不放依賴項，避免每次 render 都重建 observer

  return (
    <div
      ref={loadMoreRef}
      className={cn("flex w-full items-center justify-center py-8", className)}
    >
      {!isLoading ? (
        isFetching ? (
          <Spinner className="size-11 text-primary" />
        ) : !hasMore && !!dataLength ? (
          <p className="text-sm text-primary/70">Bottom reached.</p>
        ) : null
      ) : null}
    </div>
  );
}

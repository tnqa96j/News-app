import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import NewsItem from "@/components/NewsItem";
import Header from "@/components/Header";
import SwipeActionWrapper from "@/components/SwipeActionWrapper";
import LoadMore from "@/components/LoadMore";
import Empty from "@/components/Empty";
import Error from "@/components/Error";
import Masonry from "react-masonry-css";
import ScrollToTop from "@/components/ScrollToTop";

import { useState } from "react";
import { useDeviceWidth } from "@/hooks/useDeviceWidth";
import { useUser } from "@/hooks/useUser";
import { useDialog } from "@/contexts/DialogContext";

import { toastError, getErrorMessage } from "@/assets/utils";
import { cn } from "@/lib/utils";

import type { GetPaginationParams } from "@/types/api";
import {
  useGetFavoritesQuery,
  useRemoveFromFavoritesMutation,
} from "@/store/features/api/favoritesApiSlice";

const MAX_LIMIT: number = 6;

const BREAK_POINT_COL = {
  default: 3,
  1024: 2,
  768: 1,
};

export default function Favorites() {
  const [queryParams, setQueryParams] = useState<GetPaginationParams>({
    offset: 0,
    limit: MAX_LIMIT,
    sort: "newest",
  });

  const { isMobile } = useDeviceWidth(),
    { openDialog } = useDialog(),
    { isLoggedIn } = useUser();

  const { data, isLoading, isFetching, isError, isSuccess } =
    useGetFavoritesQuery(queryParams, { skip: !isLoggedIn });
  const [removeFromFavList] = useRemoveFromFavoritesMutation();

  // 從收藏清單移除
  const handleRemove = async (newsId: string) => {
    openDialog({
      title: "Confirm removal from your favorite list?",
      description: "This action cannot be undone.",
      confirmText: "Continue",
      confirmVariant: "destructive",
      onConfirm: async () => {
        try {
          await removeFromFavList(newsId).unwrap();
          toast.success(`Removed from favorites successfully.`, {
            position: "top-center",
          });
        } catch (error) {
          toastError(
            "Fail to remove from favorite list",
            getErrorMessage(error),
          );
        }
      },
    });
  };

  // 渲染內容
  let content;
  if (isLoading) {
    content = (
      <Masonry
        breakpointCols={BREAK_POINT_COL}
        className="-ml-7.5 flex w-auto md:[&>div:nth-child(2)]:mt-12 lg:[&>div:nth-child(2)]:mt-16"
        columnClassName="pl-7.5 bg-clip-paddding flex flex-col md:gap-6"
      >
        {Array.from({ length: 6 }, (val, i) => i).map((index) => (
          <div
            key={index}
            className={cn("mb-6 flex gap-5 px-5 py-2.5", "md:flex-col")}
          >
            <div className={cn("w-full", "md:order-2")}>
              {/* title */}
              <Skeleton className={cn("mb-2 h-5 w-full", "md:mb-4 md:h-7")} />
              <Skeleton className={cn("h-5 w-[80%]", "md:mb-5 md:h-7")} />
              {/* description */}
              <Skeleton
                className={cn("mt-3 h-3 w-[50%]", "md:h-4 md:w-full")}
              />
              <Skeleton className={cn("mt-3 hidden h-4 w-full", "md:block")} />
              <Skeleton className={cn("mt-3 hidden h-4 w-full", "md:block")} />
              <Skeleton className={cn("mt-3 hidden h-4 w-full", "md:block")} />
            </div>
            {/* image */}
            <Skeleton
              className={cn("size-18 shrink-0", "md:order-1 md:h-60 md:w-full")}
            />
            {/* source */}
            <div className={cn("hidden", "order-3 items-center gap-5 md:flex")}>
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-6 w-25 lg:w-35" />
            </div>
            {/* Button */}
            <Skeleton className="order-4 hidden h-14 w-full rounded-full md:block" />
          </div>
        ))}
      </Masonry>
    );
  } else if (isError) {
    return <Error />;
  } else if (isSuccess) {
    content =
      data.favoriteList.length === 0 ? (
        <Empty
          title="No Favorites Yet"
          description="News you save will appear here for quick access. Start exploring and tap the star icon to save your first story!"
        />
      ) : (
        <Masonry
          breakpointCols={BREAK_POINT_COL}
          className="-ml-7.5 flex w-auto md:[&>div:nth-child(2)]:mt-12 lg:[&>div:nth-child(2)]:mt-16"
          columnClassName="pl-7.5 bg-clip-paddding flex flex-col md:gap-6"
        >
          {data.favoriteList.map((newsItem) => {
            return isMobile ? (
              <SwipeActionWrapper
                key={newsItem._id}
                index={newsItem._id}
                onRemove={handleRemove}
              >
                <NewsItem variant="default" info={newsItem} />
              </SwipeActionWrapper>
            ) : (
              <NewsItem
                key={newsItem._id}
                variant="card"
                info={newsItem}
                onRemove={handleRemove}
              />
            );
          })}
        </Masonry>
      );
  }

  return (
    <div className="main-bg">
      <NavBar title="Favorites" />
      <header className="hidden md:block">
        <Header />
      </header>

      <div className="p-base">
        <h1 className="hidden text-48-64 md:block lg:[column-span:all]">
          Favorites
        </h1>
        {content}
      </div>

      <LoadMore
        isFetching={isFetching}
        isLoading={isLoading}
        hasMore={data?.hasMore ?? false}
        dataLength={data?.favoriteList.length ?? 0}
        onLoadMore={() => {
          setQueryParams((prev) => ({
            ...prev,
            offset: (prev.offset ?? 0) + (prev.limit ?? MAX_LIMIT),
          }));
        }}
      />

      <ScrollToTop />
    </div>
  );
}

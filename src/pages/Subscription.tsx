import { Skeleton } from "@/components/ui/skeleton";
import NavBar from "@/components/NavBar";
import Header from "@/components/Header";
import NewsItem from "@/components/NewsItem";
import TagGroup from "@/components/TagGroup";
import Error from "@/components/Error";
import Empty from "@/components/Empty";
import LoadMore from "@/components/LoadMore";
import ScrollToTop from "@/components/ScrollToTop";

import { cn } from "@/lib/utils";
import { getDateRange } from "@/assets/utils";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import type { GetNewsParams } from "@/types/news";

import { useGetSubscriptionsQuery } from "@/store/features/api/subscriptionApiSlice";
import { useGetNewsQuery } from "@/store/features/api/newsApiSlice";

const MAX_LIMIT: number = 6;
const TIME_TAGS = ["All", "Today", "Yesterday"];

const SubLoading = () => {
  return (
    <>
      {Array.from({ length: 10 }, (_val, i) => i).map((index) => (
        <div
          className={cn(
            "flex w-17.5 flex-col items-center gap-2 px-3 py-1",
            "md:w-full md:flex-row md:gap-4 md:px-3 md:py-3",
          )}
          key={index}
        >
          <Skeleton className="size-14 shrink-0 rounded-full md:size-8 lg:size-10" />
          <Skeleton className="h-4 w-full md:h-6 lg:h-7" />
          <Skeleton className="h-4 w-full md:hidden" />
        </div>
      ))}
    </>
  );
};

const TagsLoading = () => {
  return (
    <>
      <div className="scrollbar-hide flex gap-2 overflow-x-scroll py-5">
        {Array.from({ length: 6 }, (_val, i) => i).map((index) => (
          <Skeleton
            key={index}
            className="h-8 w-25 shrink-0 rounded-full md:h-10 md:w-30"
          />
        ))}
      </div>
    </>
  );
};

const NewsLoading = () => {
  return (
    <section className="grid md:grid-cols-2">
      {Array.from({ length: 6 }, (_val, i) => i).map((index) => (
        <div key={index} className="flex flex-col gap-2 px-3 py-4 md:gap-5">
          <Skeleton className="aspect-video w-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-[60%]" />
          </div>

          <Skeleton className="h-4 w-[40%]" />
        </div>
      ))}
    </section>
  );
};

export default function Subscription() {
  const [selectedTag, setSelectedTag] = useState("All"),
    [selectedSourceId, setSelectedSourceId] = useState<string | null>(null),
    [queryParams, setQueryParams] = useState<GetNewsParams>({
      offset: 0,
      limit: MAX_LIMIT,
      sort: "newest",
    });

  const { isLoggedIn } = useUser();

  // 取得訂閱新聞來源清單
  const {
    data: subData,
    isError: isSubError,
    // isFetching: isSubFetching,
    isLoading: isSubLoading,
    isSuccess: isSubSuccess,
  } = useGetSubscriptionsQuery(
    {
      offset: 0,
      limit: 30,
      sort: "newest",
    },
    { skip: !isLoggedIn },
  );
  // 訂閱清單載入完成後，預設選第一個新聞來源
  useEffect(() => {
    (async () => {
      if (subData?.subList.length && !selectedSourceId) {
        setSelectedSourceId(subData.subList[0].sourceId);
      }
    })();
  }, [subData, selectedSourceId]);

  // 切換新聞來源或tag時重置queryParams
  useEffect(() => {
    (async () => {
      if (!selectedSourceId) return;
      const dateRange = getDateRange(selectedTag);
      setQueryParams({
        offset: 0,
        limit: MAX_LIMIT,
        sourceId: selectedSourceId,
        ...dateRange,
      });
    })();
  }, [selectedSourceId, selectedTag]);

  // 根據選擇的新聞來源取得新聞清單
  const {
    data: newsData,
    isError: isNewsError,
    isFetching: isNewsFetching,
    isLoading: isNewsLoading,
    isSuccess: isNewsSuccess,
  } = useGetNewsQuery(queryParams, {
    skip: !selectedSourceId || !isLoggedIn, // 沒有選擇來源/沒有登入就不發請求
  });

  // 渲染內容
  let mainContent, subContent, tagsContent, newsContent;
  if (isSubLoading) {
    subContent = <SubLoading />;
    tagsContent = <TagsLoading />;
    newsContent = <NewsLoading />;
  } else if (isSubError || isNewsError) {
    return <Error />;
  } else if (isSubSuccess) {
    if (subData.subList.length === 0) {
      mainContent = (
        <section className="col-span-full">
          <Empty
            title="No Subscriptions"
            description="You haven't followed any news sources yet. Follow your favorite publishers to build a personalized feed here!"
          />
        </section>
      );
    } else {
      subContent = (
        <>
          {subData.subList.map((sub) => (
            <button
              key={sub.subscriptionId}
              className={cn(
                "flex w-20 flex-col items-center gap-1 rounded-base px-3 py-1",
                "md:w-full md:flex-row md:gap-4 md:py-3",
                "cursor-pointer",
                selectedSourceId === sub.sourceId &&
                  "font-medium text-primary md:bg-primary/20",
                selectedSourceId !== sub.sourceId &&
                  "hover:text-primary/90 md:hover:bg-primary/5 md:hover:text-text-light dark:md:hover:text-text-dark",
              )}
              onClick={() => {
                setSelectedSourceId(sub.sourceId);
                setSelectedTag("All"); // 切換來源時重置tag
              }}
            >
              <div className="[avatar] size-14 circle-base md:size-8 lg:size-10"></div>
              <p className="max-h-12 min-h-12 w-full overflow-hidden text-ellipsis whitespace-pre-wrap md:min-h-0 md:text-start md:whitespace-nowrap">
                {sub.sourceName}
              </p>
            </button>
          ))}
        </>
      );
      tagsContent = (
        <TagGroup
          tags={TIME_TAGS}
          selectedTag={selectedTag}
          onTagClick={setSelectedTag}
          containerClassName="gap-2 py-5 md:pt-0"
          tagClassName="dark:hover:text-primary dark:hover:border-primary"
          activeClassName="dark:text-primary dark:border-primary"
        />
      );

      // NewsItem
      if (!selectedSourceId) {
        newsContent = null;
      } else if (
        isNewsLoading ||
        (isNewsFetching && queryParams.offset === 0)
      ) {
        newsContent = <NewsLoading />;
      } else if (isNewsSuccess) {
        newsContent = !newsData.stories.length ? (
          <Empty
            description="We couldn't find any news from this source within the selected time
          range. Try adjusting your filters or choosing a different tag."
          />
        ) : (
          <section className="grid md:grid-cols-2">
            {newsData.stories.map((newsItem) => (
              <NewsItem key={newsItem._id} variant="portrait" info={newsItem} />
            ))}
          </section>
        );
      }

      mainContent = (
        <>
          <section
            className={cn(
              "scrollbar-hide flex items-center gap-2 overflow-x-scroll text-16-20",
              "md:col-span-4 md:flex-col md:items-start md:gap-0",
            )}
          >
            {subContent}
          </section>

          <section className="md:col-span-8">
            {tagsContent}
            {newsContent}
          </section>
        </>
      );
    }
  }

  return (
    <div className="main-bg">
      <NavBar title="Subscription" />
      <header className="hidden md:block">
        <Header />
      </header>

      <div className="grid grid-cols-1 p-base md:grid-cols-12 md:gap-10">
        <h1 className="col-span-full hidden text-48-64 md:block">
          Your Subscription
        </h1>

        {mainContent}

        {/* load more */}
        <section className="md:col-span-8 md:col-start-5">
          <LoadMore
            isFetching={isNewsFetching}
            isLoading={isNewsLoading}
            hasMore={newsData?.hasMore ?? false}
            dataLength={newsData?.stories.length ?? 0}
            onLoadMore={() => {
              setQueryParams((prev) => ({
                ...prev,
                offset: (prev.offset ?? 0) + (prev.limit ?? MAX_LIMIT),
              }));
            }}
          />
        </section>
      </div>
      <ScrollToTop />
    </div>
  );
}

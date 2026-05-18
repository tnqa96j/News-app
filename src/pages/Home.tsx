import { useState } from "react";
import { cn } from "@/lib/utils";
import Header from "../components/Header";
import NewsItem from "../components/NewsItem";
import { Skeleton } from "@/components/ui/skeleton";
import TagGroup from "@/components/TagGroup";
import CarouselBanner from "@/components/CarouselBanner";

import type { GetNewsParams } from "@/types/news";
import { groupStoriesByDate, getformatTimeObject } from "@/assets/utils";
import { useGetNewsQuery } from "@/store/features/api/newsApiSlice";
import Empty from "@/components/Empty";
import Error from "@/components/Error";
import LoadMore from "@/components/LoadMore";
import ScrollToTop from "@/components/ScrollToTop";

const SECTIONS: string[] = [
  "all",
  "world",
  "technology",
  "business",
  "science",
  "sport",
  "culture",
];

const MAX_LIMIT: number = 5;

export default function Home() {
  const [selectedTag, setSelectedTag] = useState<string>(SECTIONS[0]),
    [queryParams, setQueryParams] = useState<GetNewsParams>({
      category: selectedTag === "all" ? undefined : selectedTag,
    });

  const today = getformatTimeObject(new Date());

  const { data, isLoading, isFetching, isError, isSuccess } =
    useGetNewsQuery(queryParams);

  // tag switch
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setQueryParams({
      category: tag === "all" ? undefined : tag,
      offset: 0, // 切換tag時offset歸0
      limit: MAX_LIMIT,
    }); // 切換tag時把time清掉，讓merge邏輯覆蓋而不是合併
  };

  // 渲染內容
  let content;
  if (isLoading || (isFetching && queryParams.offset === 0)) {
    content = (
      <>
        {/* tags */}
        {/* <div className="my-2.5 scrollbar-hide flex gap-5 overflow-x-scroll px-5 md:my-9 md:px-0">
          {Array.from({ length: 7 }, (val, i) => i).map((index) => (
            <Skeleton key={index} className="h-11 w-22 shrink-0 md:w-30" />
          ))}
        </div> */}
        {/* banner */}
        <Skeleton className="h-93.75 rounded-none md:h-90 md:rounded-base lg:h-100" />
        {/* date */}
        <Skeleton className="my-3 h-3 w-full md:my-5 md:h-6 lg:my-8" />
        {/* news items */}
        {Array.from({ length: 5 }, (val, i) => i).map((index) => (
          <div
            className={cn(
              "flex h-25 w-full flex-row items-center justify-between gap-5 px-5 py-2.5",
              "md:mb-5 md:h-40 md:p-5",
              "lg:h-45 lg:gap-10",
            )}
            key={index}
          >
            <div className="flex h-18 min-w-0 flex-1 flex-col justify-between gap-2 md:h-full">
              <Skeleton className="h-5 md:h-9" />
              <Skeleton className="h-5 md:h-9" />
              <Skeleton className="h-4 w-40 md:h-6" />
            </div>
            <Skeleton className="size-18 shrink-0 bg-primary md:h-full md:w-40 md:rounded-base lg:w-50" />
          </div>
        ))}
      </>
    );
  } else if (isError) {
    return <Error />;
  } else if (isSuccess) {
    content =
      data.stories.length === 0 ? (
        <Empty
          title="No News Available"
          description="It looks like there are no stories to show right now. Try adjusting your filters or check back later for the latest updates."
        />
      ) : (
        <>
          {/* banner carousel */}
          <CarouselBanner data={data?.topStories ?? []} />
          {/* date & newsItem */}
          {groupStoriesByDate(data?.stories ?? []).map(
            ({ date, stories }, index) => {
              const time = getformatTimeObject(date);
              return (
                <div key={index}>
                  <p className="date-divider my-3 text-12-24 leading-none text-nowrap md:my-5 lg:my-10">
                    {`${time.month}  ${time.day}`}
                  </p>
                  {stories.map((newsItem) => (
                    <NewsItem key={newsItem._id} info={newsItem} />
                  ))}
                </div>
              );
            },
          )}
        </>
      );
  }

  return (
    <div className="main-bg">
      <Header />

      <div className="md:p-base">
        <h1 className="hidden md:block md:text-[clamp(48px,30.6px+2.32vw,64px)] md:leading-none">
          Latest News
        </h1>

        <p className="hidden md:block md:pt-2.5 md:text-[clamp(20px,15.65px+0.58vw,24px)]">
          {today.month} {today.day} , {today.year}
        </p>

        {/* tags */}
        <TagGroup
          tags={SECTIONS}
          selectedTag={selectedTag}
          onTagClick={handleTagClick}
          containerClassName="bg-primary md:my-9 md:gap-2.5 md:bg-transparent xl:my-10.5"
          tagClassName={cn(
            "text-text-dark border-none rounded-none px-4 py-2.5 hover:text-text-dark hover:bg-primary-light transition-all",
            "md:capsule-base md:text-text-light md:hover-base md:hover:bg-transparent",
          )}
          activeClassName="bg-primary-light text-text-dark md:border-primary md:bg-transparent md:text-primary"
        />

        {content}

        <LoadMore
          isFetching={isFetching}
          isLoading={isLoading}
          hasMore={data?.hasMore ?? false}
          dataLength={data?.stories.length ?? 0}
          onLoadMore={() => {
            setQueryParams((prev) => ({
              ...prev,
              offset: (prev.offset ?? 0) + (prev.limit ?? MAX_LIMIT),
            }));
          }}
        />
      </div>
      
      <ScrollToTop />
    </div>
  );
}

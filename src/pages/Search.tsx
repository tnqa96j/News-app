import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import NewsItem from "@/components/NewsItem";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Empty from "@/components/Empty";
import Error from "@/components/Error";
import LoadMore from "@/components/LoadMore";
import ScrollToTop from "@/components/ScrollToTop";

import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import type { RouteComponentProps } from "@/router";
import type { GetNewsParams } from "@/types/news";
import { useGetNewsQuery } from "@/store/features/api/newsApiSlice";

const MAX_LIMIT: number = 5;
type SortOrder = "newest" | "oldest";

export default function Search({ usp }: RouteComponentProps) {
  const q = usp.get("q") ?? "";
  const [queryParams, setQueryParams] = useState<GetNewsParams>({
    q,
    offset: 0,
    limit: MAX_LIMIT,
  });

  // 這個是不是跟上面是同樣意思？
  useEffect(() => {
    (async () => {
      setQueryParams({ q, offset: 0, limit: MAX_LIMIT });
    })();
  }, [q]);

  // page title
  useEffect(() => {
    if (q) {
      document.title = `Search '${q}' - Daily News`;
    }
  }, [q]);

  const { data, isLoading, isFetching, isError, isSuccess } = useGetNewsQuery(
    queryParams,
    { skip: !q },
  ); // 如果q是空字串就不呼叫api

  // 渲染內容
  let content;
  if (isLoading || (isFetching && queryParams.offset === 0)) {
    content = (
      <>
        {/* header */}
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2 md:pt-5 md:pb-5">
          <Skeleton className="h-6 w-50 grow-0 md:h-7" />
          <Skeleton className="h-6 w-37.5 shrink-0 md:h-7" />
        </div>

        {Array.from({ length: 5 }, (_val, i) => i).map((index) => (
          <div className={cn("w-full p-5", "", "")} key={index}>
            {/* title */}
            <Skeleton className="mb-2 h-7 w-full md:h-8" />
            <Skeleton className="h-7 w-[50%] md:h-8" />

            <div className="mt-3 flex gap-5 md:mt-5">
              {/* description */}
              <div className="flex flex-1 flex-col justify-around">
                <Skeleton className="h-4 w-full md:h-6" />
                <Skeleton className="h-4 w-[90%] md:h-6" />
                <Skeleton className="h-4 w-[60%] md:h-6" />
                <Skeleton className="hidden h-6 w-[30%] md:block" />
              </div>
              {/* image */}
              <Skeleton className="size-18 shrink-0 bg-primary md:h-32 md:w-30 md:rounded-base lg:w-35" />
            </div>
          </div>
        ))}
      </>
    );
  } else if (isError) {
    return <Error />;
  } else if (isSuccess) {
    content = (
      <>
        {/* top info */}
        <section className="flex items-center justify-between px-5 pt-3">
          <span className="text-16-20 text-muted-foreground italic">
            <span className="font-bold text-primary">{data?.total}</span>{" "}
            <span>
              results found for "
              <span className="font-bold text-primary">{q}</span>".
            </span>
          </span>
          {/* sort order */}
          <Select
            value={queryParams.sort ?? "newest"}
            onValueChange={(value: SortOrder) => {
              setQueryParams({
                ...queryParams,
                sort: value,
                offset: 0, // 切換排序時，offset歸0
              });
            }}
          >
            <SelectTrigger className="w-37.5 cursor-pointer border-none text-muted-foreground hover:bg-primary/10 md:w-50">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="w-50">
              <SelectGroup>
                <SelectItem
                  value="newest"
                  className="cursor-pointer px-2.5 py-2 text-16-20"
                >
                  Newest first
                </SelectItem>
                <SelectItem
                  value="oldest"
                  className="cursor-pointer px-2.5 py-2 text-16-20"
                >
                  Oldest first
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </section>
        {/* newsItem */}
        {data.stories.length === 0 ? (
          <Empty
            title="No Matches Found"
            description="We couldn't find anything matching your search. Check your spelling or try using different keywords."
          />
        ) : (
          <>
            {data.stories.map((newsItem) => (
              <NewsItem
                key={newsItem._id}
                info={newsItem}
                variant="search"
                highlight={q}
              />
            ))}
          </>
        )}
      </>
    );
  }

  return (
    <div className="main-bg">
      <NavBar title={`Search ' ${q} '`} />
      <header className="hidden md:block">
        <Header />
      </header>

      <div className="md:p-base">
        <h1 className="col-span-full hidden text-48-64 md:block">
          Search '<span className="text-primary italic">{q}</span> '
        </h1>

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

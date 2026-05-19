import { createApi } from "@reduxjs/toolkit/query/react";
import type { INews, NewsListData, GetNewsParams } from "@/types/news";
import { customBaseQuery } from "@/store/features/api";

export const newsApiSlice = createApi({
  reducerPath: "newsApi",
  baseQuery: customBaseQuery,
  tagTypes: ["News", "NewsDetail"],
  endpoints: (builder) => ({
    // 獲取新聞列表
    getNews: builder.query<NewsListData, GetNewsParams>({
      query: (params) => ({
        url: "/api/news",
        method: "GET",
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const category = queryArgs.category ?? "all";
        const q = queryArgs.q ?? "";
        const sort = queryArgs.sort ?? "newest";
        const sourceId = queryArgs.sourceId ?? "";
        const publishedAfter = queryArgs.publishedAfter ?? "";
        const publishedBefore = queryArgs.publishedBefore ?? "";
        return `${category}_${q}_${sort}_${sourceId}_${publishedAfter}_${publishedBefore}`; // 用category & q作為快取key，只要category/q相同就視為同一份快取
      },
      // 新資料進來時，將新的stories接在舊的後面（注意：去掉重複的）
      merge: (currentCache, newData, { arg }) => {
        // arg：本次請求的queryArgs
        // offset > 0代表「載入更多」=> 將快取資料和新fetch到的資料合併
        if (arg.offset && arg.offset > 0) {
          const existingIds = new Set(
            currentCache.stories.map((s) => s._id) ?? [],
          );
          const deduped = newData.stories.filter(
            (s) => !existingIds.has(s._id), // 過濾掉已存在的
          );
          return {
            ...newData,
            stories: [...(currentCache.stories ?? []), ...deduped],
            topStories: currentCache.topStories,
          };
        }
        // offset = 0代表是「切換tag/全新載入」 => 直接覆蓋快取資料
        return newData;
      },
      // time參數改變時強制重新請求
      forceRefetch: ({ currentArg, previousArg }) => {
        return (
          //currentArg?.time !== previousArg?.time ||
          currentArg?.category !== previousArg?.category ||
          currentArg?.offset !== previousArg?.offset ||
          currentArg?.sort !== previousArg?.sort
        );
      },
      providesTags: ["News"],
    }),
    // 獲取單篇新聞的詳細內容
    getNewsDetail: builder.query<INews, string>({
      // string是newsId的型別
      query: (newsId) => ({
        url: `/api/news/${newsId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, newsId) => [
        { type: "NewsDetail", id: newsId }, // 用newsId標記這筆快取，可以精確地讓某篇文章的快取失效
      ],
    }),
  }),
});

export const { useGetNewsQuery, useGetNewsDetailQuery } = newsApiSlice;

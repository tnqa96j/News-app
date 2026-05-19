import { createApi } from "@reduxjs/toolkit/query/react";
import type { FavoritesListData } from "@/types/user";
import type { GetPaginationParams } from "@/types/api";
import { customBaseQuery } from "@/store/features/api";

export const favoritesApiSlice = createApi({
  reducerPath: "favoritesApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Favorites"],
  endpoints: (builder) => ({
    // 確認使用者是否收藏該篇新聞 GET /api/user/favorites/:newsId
    checkFavorite: builder.query<{ isFavorited: boolean }, string>({
      query: (newsId) => ({
        url: `/api/user/favorites/${newsId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, newsId) => [
        {
          type: "Favorites",
          id: newsId,
        },
      ],
    }),
    // 獲取使用者收藏新聞列表 GET /api/user/favorites
    getFavorites: builder.query<FavoritesListData, GetPaginationParams>({
      query: (params) => ({
        url: "/api/user/favorites",
        method: "GET",
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const sort = queryArgs.sort ?? "newest";
        return `${sort}`;
      },
      // 新資料進來時，將新的favorite list接在舊的後面
      merge: (currentCache, newData, { arg }) => {
        if (arg.offset && arg.offset > 0) {
          const existingIds = new Set(
            currentCache.favoriteList.map((s) => s._id) ?? [],
          );
          const deduped = newData.favoriteList.filter(
            (s) => !existingIds.has(s._id), // 過濾掉已存在的
          );
          return {
            ...newData,
            favoriteList: [...(currentCache.favoriteList ?? []), ...deduped],
          };
        }
        // offset = 0代表是「切換tag/全新載入」 => 直接覆蓋快取資料
        return newData;
      },
      // time參數改變時強制重新請求
      forceRefetch: ({ currentArg, previousArg }) => {
        return (
          currentArg?.offset !== previousArg?.offset ||
          currentArg?.sort !== previousArg?.sort
        );
      },
      providesTags: ["Favorites"],
    }),
    // 將該筆新聞加入收藏列表 POST /api/user/favorites
    addToFavorites: builder.mutation<null, string>({
      // mutation<ResultType, QueryArg, RawResultType>
      query: (newsId) => ({
        url: `/api/user/favorites`,
        method: "POST",
        body: { newsId },
      }),
      invalidatesTags: (_result, _error, newsId) => [
        "Favorites", // 讓getFavorites list 失效
        {
          // 讓該篇新聞(newsId)的check favorited失效
          type: "Favorites",
          id: newsId,
        },
      ],
    }),
    // 將該筆新聞移除收藏列表 DELETE /api/user/favorites/:newsId
    removeFromFavorites: builder.mutation<null, string>({
      query: (newsId) => ({
        url: `/api/user/favorites/${newsId}`,
        method: "DELETE",
      }),
      // 直接optimistic update
      async onQueryStarted(newsId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          favoritesApiSlice.util.updateQueryData(
            "getFavorites",
            {
              offset: 0,
              limit: 6,
              sort: "newest",
            },
            (draft) => {
              draft.favoriteList = draft.favoriteList.filter(
                (newsItem) => newsItem._id !== newsId,
              );
              draft.total -= 1;
              draft.hasMore = draft.favoriteList.length < draft.total;
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, newsId) => [
        "Favorites",
        {
          type: "Favorites",
          id: newsId,
        },
      ],
    }),
  }),
});

export const {
  useCheckFavoriteQuery,
  useGetFavoritesQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} = favoritesApiSlice;

/*
這裡有個問題：按下Remove Button觸發useRemoveFromFavoritesMutation操作成功後頁面不會重新fetch資料，舊的新聞還殘留
主因：serializeQueryArgs 讓所有 sort 相同的查詢共用同一份快取，invalidatesTags 重新請求後 merge 還是把新資料接在舊快取後面，而不是替換
解法：
1. 元件中：刪除成功後直接修改快取，不依賴重新請求
dispatch(
  favoritesApiSlice.util.updateQueryData(
    "getFavorites",
    queryParams, // 當前的查詢參數
    (draft) => {
      draft.favoriteList = draft.favoriteList.filter(
        (item) => item._id !== newsId,
      );
      draft.total -= 1;
      draft.hasMore = draft.total > (queryParams.offset ?? 0) + (queryParams.limit ?? 5);
    },
  ),
);
2. 在RTK Query管理Api中刪除動作開始時直接樂觀更新 optimistic update
      async onQueryStarted(newsId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          favoritesApiSlice.util.updateQueryData(
            "getFavorites",
            {
              offset: 0,
              limit: 6,
              sort: "newest",
            },
            (draft) => {
              draft.favoriteList = draft.favoriteList.filter(
                (newsItem) => newsItem._id !== newsId,
              );
              draft.total -= 1;
              draft.hasMore = draft.favoriteList.length < draft.total;
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
*/

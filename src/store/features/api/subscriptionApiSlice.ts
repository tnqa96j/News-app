import { createApi } from "@reduxjs/toolkit/query/react";
import type { SubscriptionListData } from "@/types/user";
import type { GetPaginationParams } from "@/types/api";
import { customBaseQuery } from "@/store/features/api";

export const subscriptionApiSlice = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Subscriptions"],
  endpoints: (builder) => ({
    // 確認使用者是否訂閱 GET /api/user/subscriptions/:sourceId
    checkSubscribe: builder.query<{ subscribed: boolean }, string>({
      query: (sourceId) => ({
        url: `/api/user/subscriptions/${sourceId}`,
        method: "GET",
      }),
      providesTags: (result, error, sourceId) => [
        {
          type: "Subscriptions",
          id: sourceId,
        },
      ],
    }),
    // 獲取訂閱清單 GET /api/user/subscriptions
    getSubscriptions: builder.query<SubscriptionListData, GetPaginationParams>({
      query: (params) => ({
        url: "/api/user/subscriptions",
        method: "GET",
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const sort = queryArgs.sort ?? "newest";
        return `${sort}`;
      },
      // 新資料進來時，將新的data list接在舊的後面
      merge: (currentCache, newData, { arg }) => {
        // arg：本次請求的queryArgs
        // offset > 0代表「載入更多」=> 將快取資料和新fetch到的資料合併
        if (arg.offset && arg.offset > 0) {
          const existingIds = new Set(
            currentCache.subList.map((s) => s.subscriptionId) ?? [],
          );
          const deduped = newData.subList.filter(
            (s) => !existingIds.has(s.subscriptionId), // 過濾掉已存在的
          );
          return {
            ...newData,
            subList: [...(currentCache.subList ?? []), ...deduped],
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
      providesTags: ["Subscriptions"],
    }),
    // 訂閱 POST /api/user/subscriptions
    subscribe: builder.mutation<null, { sourceId: string; sourceName: string }>(
      {
        // mutation<ResultType, QueryArg, RawResultType>
        query: ({ sourceId, sourceName }) => ({
          url: `/api/user/subscriptions`,
          method: "POST",
          body: { sourceId, sourceName },
        }),
        invalidatesTags: (result, error, { sourceId }) => [
          "Subscriptions",
          {
            type: "Subscriptions",
            id: sourceId,
          },
        ],
      },
    ),
    // 取消訂閱 /api/user/subscriptions/:sourceId
    unsubscribe: builder.mutation<null, string>({
      query: (sourceId) => ({
        url: `/api/user/subscriptions/${sourceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, sourceId) => [
        "Subscriptions",
        {
          type: "Subscriptions",
          id: sourceId,
        },
      ],
    }),
  }),
});

export const {
  useCheckSubscribeQuery,
  useGetSubscriptionsQuery,
  useSubscribeMutation,
  useUnsubscribeMutation,
} = subscriptionApiSlice;

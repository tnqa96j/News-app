import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  CommentListData,
  GetCommentsParams,
  ReactionType,
  ReactionResult,
} from "@/types/comment";
import { customBaseQuery } from "@/store/features/api";
import type { RootState } from "@/store";

export const commentApiSlice = createApi({
  reducerPath: "commentApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    // GET /api/news/:newsId/comments
    getComments: builder.query<CommentListData, GetCommentsParams>({
      query: ({ newsId, ...params }) => ({
        // 對應原本的queryComments
        url: `/api/news/${newsId}/comments`,
        method: "GET",
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        // newsId + sort + parentCommentId決定快取key
        return `${queryArgs.newsId}_${queryArgs.sort ?? "newest"}_${queryArgs.parentCommentId ?? "null"}`;
      },
      merge: (currentCache, newData, { arg }) => {
        if (arg.offset && arg.offset > 0) {
          const existingIds = new Set(
            currentCache.commentList.map((c) => c._id) ?? [],
          );
          const deduped = newData.commentList.filter(
            (c) => !existingIds.has(c._id),
          );
          return {
            ...newData,
            commentList: [...(currentCache.commentList ?? []), ...deduped],
          };
        }
        return newData;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return (
          currentArg?.offset !== previousArg?.offset ||
          currentArg?.sort !== previousArg?.sort
        );
      },
      providesTags: ["Comment"],
    }),
    // POST /api/news/:newsId/comments
    addComment: builder.mutation<
      null,
      {
        newsId: string;
        content: string;
        parentCommentId?: string;
        replyToUserId?: string;
      }
    >({
      query: ({ newsId, ...body }) => ({
        url: `/api/news/${newsId}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Comment"], // 新增留言後讓快取失效，重新從第一頁拿
    }),
    // DELETE /api/comments/:commentId
    removeComment: builder.mutation<
      null,
      { commentId: string; queryArgs: GetCommentsParams }
    >({
      query: ({ commentId }) => ({
        url: `/api/comments/${commentId}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { commentId, queryArgs },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          commentApiSlice.util.updateQueryData(
            "getComments",
            queryArgs,
            (draft) => {
              // 直接從快取中移除
              draft.commentList = draft.commentList.filter(
                (c) => c._id !== commentId,
              );
              draft.total -= 1;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // 失敗就還原
        }
      },
    }),
    // PATCH /api/comments/:commentId
    updateComment: builder.mutation<
      null,
      { commentId: string; content: string; queryArgs: GetCommentsParams }
    >({
      query: ({ commentId, content }) => ({
        url: `/api/comments/${commentId}`,
        method: "PATCH",
        body: { content },
      }),
      async onQueryStarted(
        { commentId, content, queryArgs },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          commentApiSlice.util.updateQueryData(
            "getComments",
            queryArgs,
            (draft) => {
              const item = draft.commentList?.find((c) => c._id === commentId);
              // 直接修改快取裡的content內容
              if (item) {
                item.content = content;
                item.isEdited = true;
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    // POST /api/comments/:commentId/reaction
    handleReaction: builder.mutation<
      ReactionResult,
      {
        commentId: string;
        type: ReactionType;
        queryArgs: GetCommentsParams;
      }
    >({
      query: ({ commentId, type }) => ({
        url: `/api/comments/${commentId}/reaction`,
        method: "POST",
        body: { type },
      }),
      async onQueryStarted(
        { commentId, type, queryArgs },
        { dispatch, queryFulfilled, getState },
      ) {
        const userId = (getState() as RootState).user.info?._id;
        if (!userId) return;

        const patchResult = dispatch(
          commentApiSlice.util.updateQueryData(
            "getComments",
            queryArgs,
            (draft) => {
              const item = draft.commentList?.find((c) => c._id === commentId);
              if (!item) return;

              const wasLiked = item.userReaction === 1,
                wasDisliked = item.userReaction === -1;

              if (type === 1) {
                if (wasLiked) {
                  item.likesCount -= 1;
                  item.userReaction = 0;
                } else {
                  item.likesCount += 1;
                  if (wasDisliked) item.dislikesCount -= 1;
                  item.userReaction = 1;
                }
              } else if (type === -1) {
                if (wasDisliked) {
                  item.dislikesCount -= 1;
                  item.userReaction = 0;
                } else {
                  item.dislikesCount += 1;
                  if (wasLiked) item.likesCount -= 1;
                  item.userReaction = -1;
                }
              } else {
                // type === 0，取消所有反應
                if (wasLiked) item.likesCount -= 1;
                if (wasDisliked) item.dislikesCount -= 1;
                item.userReaction = 0;
              }
            },
          ),
        );
        try {
          // 後端回傳真實結果，用真實值更新快取
          const { data: realResult } = await queryFulfilled;
          dispatch(
            commentApiSlice.util.updateQueryData(
              "getComments",
              queryArgs,
              (draft) => {
                const item = draft.commentList.find((c) => c._id === commentId);
                if (item && realResult) {
                  item.likesCount = realResult.likesCount;
                  item.dislikesCount = realResult.dislikesCount;
                  item.userReaction = realResult.userReaction;
                }
              },
            ),
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useAddCommentMutation,
  useHandleReactionMutation,
  useGetCommentsQuery,
  useRemoveCommentMutation,
  useUpdateCommentMutation,
} = commentApiSlice;

/*
removeComment：
  直接從快取commentList中移除要移除的新聞資料
updateComment：
  前端送出的 content = 後端儲存的 content
  樂觀更新的結果 = 後端真實結果
  → 不需要二次確認，樂觀更新就夠了
handleReaction：
  前端預測的 likesCount/userReaction 是「猜的」
  後端可能因為 race condition（兩個用戶同時按讚）導致計數不同
  → 需要用後端的真實計數修正
*/

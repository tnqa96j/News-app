import type { ListData } from "@/types/api";
import type { GetPaginationParams } from "@/types/api";

/* comment */
export type ReactionType = 1 | -1 | 0;

export interface IComment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    pic: string;
  };
  newsId: string;
  content: string;
  parentCommentId: string | null;
  replyToUserId: {
    name: string;
  } | null;
  replyCount: number;
  likesCount: number;
  dislikesCount: number;
  userReaction: ReactionType;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentListData extends ListData {
  commentList: IComment[];
}

export interface GetCommentsParams extends GetPaginationParams {
  newsId: string;
  parentCommentId?: string | null;
}

// reaction
export interface ReactionResult {
  likesCount: number;
  dislikesCount: number;
  userReaction: 1 | -1 | 0;
}

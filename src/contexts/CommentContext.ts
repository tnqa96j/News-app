import type { GetCommentsParams } from "@/types/comment";
import { createContext, useContext } from "react";
interface CommentContextType {
  queryArgs: GetCommentsParams;
  setQueryArgs: (queryArgs: GetCommentsParams) => void;
}

export const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const useCommentContext = () => {
  const ctx = useContext(CommentContext);
  if (!ctx)
    throw new Error("useCommentContext must be used within CommentList");
  return ctx;
};

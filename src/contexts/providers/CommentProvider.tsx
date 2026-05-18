import type { ReactNode } from "react";
import type { GetCommentsParams } from "@/types/comment";
import { CommentContext } from "@/contexts/CommentContext";

export const CommentProvider = ({
  children,
  queryArgs,
  setQueryArgs,
}: {
  children: ReactNode;
  queryArgs: GetCommentsParams;
  setQueryArgs: (queryArgs: GetCommentsParams) => void;
}) => {
  return (
    <CommentContext.Provider value={{ queryArgs, setQueryArgs }}>
      {children}
    </CommentContext.Provider>
  );
};

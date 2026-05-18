import {
  useAddCommentMutation,
  useUpdateCommentMutation,
} from "@/store/features/api/commentApiSlice";
import { useAppSelector } from "@/store";
import { type InputMode } from "@/store/features/commentSlice";
import { getErrorMessage, toastError } from "@/assets/utils";
import type { GetCommentsParams } from "@/types/comment";
import { toast } from "sonner";

/* 提交留言內容 */
interface SubmitOptions {
  mode: InputMode;
  queryArgs: GetCommentsParams; // 用於更新快取
  commentId?: string; // edit mode 需要
  onSuccess?: () => void;
  onError?: () => void;
  onFinally?: () => void;
}

export const useCommentSubmit = () => {
  const { targetId } = useAppSelector((state) => state.comment); //  commentSlice 需要加 commentId 欄位，edit 模式時存下來 ?

  const [addComment] = useAddCommentMutation(),
    [updateComment] = useUpdateCommentMutation();

  const submit = async (content: string, options: SubmitOptions) => {
    const { mode, queryArgs, commentId, onSuccess, onError, onFinally } =
      options;

    try {
      if (mode === "edit") {
        // edit mode
        await updateComment({
          commentId: commentId ?? targetId ?? "",
          content,
          queryArgs,
        }).unwrap();
        toast.success(`Comment updated!`, {
          position: "top-center",
        });
      } else {
        // add or reply mode
        await addComment({
          newsId: queryArgs.newsId,
          content,
          parentCommentId:
            mode === "reply"
              ? (queryArgs.parentCommentId ?? undefined)
              : undefined,
        }).unwrap();
        toast.success(`Comment posted!`, {
          position: "top-center",
        });
      }
      onSuccess?.();
    } catch (error) {
      toastError("Error Occurrs", getErrorMessage(error));
      onError?.();
    } finally {
      (document.activeElement as HTMLElement)?.blur();
      onFinally?.();
    }
  };

  return { submit };
};

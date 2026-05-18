/* UI */
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
/* Hook */
import React, {
  useState,
  type SetStateAction,
  type Dispatch,
  useRef,
} from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { useDialog } from "@/contexts/DialogContext";
import { useCommentSubmit } from "@/hooks/useCommentSubmit";
import { useDeviceWidth } from "@/hooks/useDeviceWidth";
/* utils */
import { formatRelativeTime, toastError } from "@/assets/utils";
import { cn } from "@/lib/utils";
/* Redux */
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setText as setInputText,
  startEdit,
} from "@/store/features/commentSlice";
import CommentActionsMenu from "./CommentActionsMenu";
import {
  useHandleReactionMutation,
  useRemoveCommentMutation,
} from "@/store/features/api/commentApiSlice";
/* types */
import type { IComment, ReactionType } from "@/types/comment";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { useCommentContext } from "@/contexts/CommentContext";
import FallbackImg from "@/assets/image/fallback-image.png";

interface CommentItemProps {
  data: IComment;
  role: "main" | "reply" | "head";
  setInputOpen?: Dispatch<SetStateAction<boolean>>; // Mobile => input drawer的 open / close
  setText?: Dispatch<SetStateAction<string>>; // Mobile => input drawer的textarea的值
}

export default function CommentItem({
  data,
  role,
  setInputOpen,
  setText,
}: CommentItemProps) {
  /* GlobalState */
  const dispatch = useAppDispatch(),
    { text: inputText } = useAppSelector((state) => state.comment); // Mobile => input drawer的textarea的值

  /* hook */
  const { user, isLoggedIn } = useUser(),
    { isMobile } = useDeviceWidth(),
    { openDialog } = useDialog(),
    { stopLoading } = useLoading(),
    { submit } = useCommentSubmit(),
    { queryArgs } = useCommentContext();

  const [handleReactionMutation] = useHandleReactionMutation(),
    [removeComment] = useRemoveCommentMutation();

  /* Local state */
  const [replyOpen, setReplyOpen] = useState<boolean>(false),
    [isEditing, setIsEditing] = useState<boolean>(false), // Desktop => edit mode時用到
    [editText, setEditText] = useState<string>(""); // Desktop => edit mode時用到

  /* props */
  const isMain = role === "main";
  const isOwner = isLoggedIn && user?._id === data.userId._id; // 是不是留言本人
  const {
    _id,
    userId: { name, pic },
    content,
    replyCount,
    likesCount,
    dislikesCount,
    userReaction,
    isEdited,
    createdAt,
  } = data;

  /* hooks */
  const textareaRef = useRef(null);

  /* Event Handler */
  const onReaction = async (type: ReactionType) => {
    if (!isLoggedIn) {
      toastError("Please login to react.");
      return;
    }
    await handleReactionMutation({ commentId: _id, type, queryArgs });
  };

  const handleEdit = () => {
    if (isMobile) {
      dispatch(
        startEdit({
          id: _id,
          text: content,
        }),
      );
      setInputOpen?.(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    await removeComment({ commentId: _id, queryArgs }).unwrap();
    toast.success("Comment deleted!", { position: "top-center" });
  };

  const handleReport = async (reason: string) => {
    toast.success(`Report for the reason ${reason}`, {
      position: "top-center",
    });
  };

  const handleReplyBtnClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isMobile) {
      if (isMain) {
        // 檢查是否有已輸入內容
        if (inputText.length > 0) {
          openDialog({
            title: "Discard comment?",
            description: "Keep writing",
            onConfirm: () => {
              dispatch(setInputText("")); // 清空redux中儲存的已輸入內容
              setReplyOpen(true);
            },
          });
        } else {
          setReplyOpen(true);
        }
      } else {
        if (!isLoggedIn) {
          toastError("Please login to reply.");
          return;
        }
        const tagText = `@${name}`;
        dispatch(
          setInputText(
            inputText.startsWith(tagText)
              ? inputText
              : `${tagText} ${inputText}`,
          ),
        );
        setInputOpen?.(true);
      }
    } else {
      if (isMain) {
        setReplyOpen(!replyOpen);
      } else {
        if (!isLoggedIn) {
          toastError("Please login to reply.");
          return;
        }
        const tagText = `@${name}`;
        const newText = inputText.startsWith(tagText)
          ? inputText
          : `${tagText} ${inputText}`;
        setText?.(newText);
      }
    }
  };

  return (
    <div className="text-16-20-24">
      {isEditing && !isMobile ? (
        <>
          <section className="flex items-center gap-10">
            {/* avatar & name */}
            <img
              className="size-6 circle-base md:size-12.5 object-cover"
              alt={name}
              src={pic || FallbackImg}
              loading="eager"
            />
            <p className="shrink-initial line-clamp-1 text-ellipsis">{name}</p>
          </section>

          <CommentForm
            ref={textareaRef}
            initialValue={content}
            text={editText}
            setText={setEditText}
            onSubmit={async () =>
              await submit(editText, {
                mode: "edit",
                queryArgs,
                commentId: _id,
                onFinally: () => {
                  setIsEditing(false);
                  stopLoading();
                },
              })
            }
            onCancel={() => setIsEditing(false)}
          />
        </>
      ) : (
        <>
          <section className="flex items-center gap-4 md:gap-10">
            {/* avatar、name、ago、isEdited、action menu */}
            <img
              className="size-6 circle-base md:size-12.5 object-cover"
              alt={name}
              src={pic || FallbackImg}
            />
            <p className="shrink-initial line-clamp-1 text-ellipsis">{name}</p>
            <p className="shrink-initial line-clamp-1 text-ellipsis">
              {formatRelativeTime(createdAt)}
            </p>
            {isEdited && (
              <p className="shrink-initial line-clamp-1 text-ellipsis">
                (Edited)
              </p>
            )}
            <div className="grow"></div>
            {isLoggedIn && (
              <CommentActionsMenu
                isOwner={isOwner}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReport={handleReport}
              />
            )}
          </section>

          <p className="mt-4 mb-7.5">{content}</p>

          <section className="flex items-center gap-5 md:gap-10">
            {/* likes */}
            <span className="flex items-center gap-4">
              <button
                onClick={() => onReaction(userReaction === 1 ? 0 : 1)}
                className="cursor-pointer"
              >
                <ThumbsUp
                  className={cn(
                    "size-6 md:size-8",
                    userReaction === 1
                      ? "text-primary"
                      : "hover:fill-primary/30",
                  )}
                />
              </button>
              <p>{likesCount}</p>
            </span>
            {/* dislikes */}
            <span className="flex items-center gap-4">
              <button
                className="cursor-pointer"
                onClick={() => onReaction(userReaction === -1 ? 0 : -1)}
              >
                <ThumbsDown
                  className={cn(
                    "size-6 md:size-8",
                    userReaction === -1
                      ? "text-primary"
                      : "hover:fill-primary/30",
                  )}
                />
              </button>
              <p>{dislikesCount}</p>
            </span>
            {/* comments */}
            <span className="flex items-center gap-4">
              <button
                className="cursor-pointer"
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => handleReplyBtnClick(e)}
              >
                <MessageCircle
                  className={cn(
                    "size-6 md:size-8",
                    replyOpen ? "text-primary" : "hover:fill-primary/30",
                  )}
                />
              </button>
              <p>{replyCount}</p>
            </span>
          </section>
        </>
      )}
      {isMain && (
        <CommentList
          open={replyOpen}
          setOpen={setReplyOpen}
          parentCommentId={_id}
          parentData={data}
        />
      )}
    </div>
  );
}

/*
< md：input框autofocus時才出現submit鍵，輸入內容後，按下input框以外的區域，input框裡的內容不會消失。按下submit鍵autofocus結束
 editing狀態時原本留言內容會出現在最下面的輸入框，並且autofocus(鍵盤會彈出)，如果輸入的內容和之前一樣 or 輸入框是空白的，送出按鈕 = disable，如果按下Input框以外的區域 or 按返回鍵退出會出現一個警示框問要繼續編輯嗎？keepwriting會繼續autofocus input框，discard的話會直接取消、清空input框內的東西。
 如果已經輸入的內容和之前有不一樣時按下cancel鍵，也會出現警示框詢問是否要繼續編輯？一樣keepwriting會繼續autofocus input框，discard的話會直接取消、清空input框內的東西

 >= md：editing時留言本身會直接變成一個input框 + cancel&save按鈕，save按鈕的禁用邏輯相同，按取消則input框變回留言內容，按save則更新留言內容
*/
/*
按下submit => button is loading => 頁面所有東西無法更改 => 有回應了再將dialog關掉 => 關掉的動畫結束後 => 清空一些狀態 => 顯示操作成功 or 失敗提示
*/

/*
Mobile 編輯狀態的 DOM 位置衝突：
1. 目前的 CommentItem 內部包了一層 isEditing ? <CommentInput /> : ...。這在 Desktop 沒問題（就地變成輸入框）。但按照你的需求，Mobile 狀態下點擊編輯，是要讓最底下 DrawerFooter 裡的輸入框變成編輯模式並 Focus。如果只用 Local State，CommentItem 無法直接控制 Drawer 最底下的 CommentInput
=> 想到的解決方法：用全域狀態處理 => 使用redux
2. Blur（失去焦點）與 Click Outside 的判定：
在 Mobile 端，按下 Submit 鍵、按下 Input 以外區域、按下 Android 返回鍵收起鍵盤，這三者都會觸發 Input 的 onBlur 事件。你需要精準區分「是因為點了送出而 Blur」還是「單純點擊外部而 Blur」，否則很容易誤觸發警示框
3. Drawer 的攔截（Intercepting Close）：
當用戶在 Mobile 端編輯到一半，如果他們試圖往下滑動關閉 Drawer 或按手機的上一頁，Vaul（Shadcn Drawer 的底層）預設會直接關閉。你需要攔截 onOpenChange，在有未儲存變更時阻止關閉並彈出警示框
4. 樓中樓（巢狀留言）的擴充性：
如果未來要實作「樓中樓」回覆功能，這套 Input 邏輯會被重複呼叫（回覆時也要改變底下 Input 的對象）。將狀態抽離會讓未來的擴展更輕鬆。
*/

/*
點擊這個按鈕會有的各種情況：
尺寸為手機：
  role = main =>  點擊會確認輸入欄有沒有殘留內容，如果有就攔截（顯示dialog），沒有就直接打開第二層CommentList
  role = head | reply => 點擊會將那個留言的留言者的名字以「@username」的形式顯示在輸入欄
尺寸為平板＆電腦
  role = main => 點擊開關主留言下的reply list
  role = head(無) | reply => 點擊會將那個留言的留言者的名字以「@username」的形式顯示在輸入欄
注意：當使用者想要刪除「@username」時，不是一個字一個字被刪掉，而是整坨刪掉
*/

// Mobile Comment Input Drawer ONLY
/* UI */
import { VisuallyHidden } from "radix-ui";
import {
  Drawer,
  DrawerPortal,
  DrawerDescription,
  DrawerClose,
  DrawerContent,
  DrawerOverlay,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import CommentForm from "./CommentForm";
/* hooks */
import {
  useState,
  useRef,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useEffectEvent,
} from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { useDialog } from "@/contexts/DialogContext";
import { useUser } from "@/hooks/useUser";
import { useCommentSubmit } from "@/hooks/useCommentSubmit";
import { useCommentContext } from "@/contexts/CommentContext";
/* redux */
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setMode,
  setText as setInputText,
  resetInput,
} from "@/store/features/commentSlice";

interface CommentInputContainerProps {
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  replyMode: boolean;
}

export default function CommentInputDrawer({
  open,
  setOpen,
  replyMode,
}: CommentInputContainerProps) {
  /* Global state */
  const dispatch = useAppDispatch(),
    {
      mode,
      text: inputText,
      originalText,
      targetId,
    } = useAppSelector((state) => state.comment);

  /* Local state */
  const [text, setText] = useState<string>(""); //

  /* Hook */
  const { isLoading, stopLoading } = useLoading(),
    { openDialog } = useDialog(),
    { submit } = useCommentSubmit(),
    { isLoggedIn } = useUser(),
    { queryArgs } = useCommentContext();

  const textAreaRef = useRef<HTMLTextAreaElement>(null),
    isSubmitted = useRef<boolean>(false);

  const isEditingChanged = mode === "edit" && text != originalText;

  const onInitial = useEffectEvent((initial: string) => {
    setText(initial);
  });

  // 剛渲染時決定text初始值
  useEffect(() => {
    if (open) {
      onInitial(mode === "edit" ? originalText : inputText);
    }
  }, [open, mode, originalText, inputText]);

  /* Method */
  const handleInteractOutside = (e: Event) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }

    if (mode === "edit") {
      if (isEditingChanged) {
        // 編輯模式，內容有變動
        e.preventDefault();
        openDialog({
          title: "Discard editing?",
          confirmText: "Discard",
          cancelText: "Keep editing",
          confirmVariant:"destructive",
          onConfirm: () => {
            dispatch(resetInput({ keepText: true }));
            setOpen?.(false);
          },
        });
      } else {
        // 編輯模式，內容無變動
        setOpen?.(false);
      }
    } else {
      // 非編輯模式
      setOpen?.(false);
    }
  };

  return (
    <>
      <button
        className="h-10 w-full truncate rounded-base border-base bg-input px-2.5 text-start text-primary"
        onClick={(e) => {
          dispatch(setMode(replyMode ? "reply" : "add"));
          setOpen?.(true);
          e.currentTarget.blur();
        }}
        disabled={!isLoggedIn}
      >
        {isLoggedIn
          ? inputText.length === 0
            ? "write a response"
            : inputText
          : "Please login before leaving a message."}
      </button>

      <Drawer
        repositionInputs={false}
        open={open}
        dismissible={!isLoading && !isEditingChanged}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // drawer關閉
            if (mode !== "edit") {
              dispatch(setInputText(text));
            }
            if (mode !== "") {
              dispatch(setMode(""));
            }
          } else {
            // drawer開啟
            setText(mode === "edit" ? originalText : inputText);
          }

          setOpen?.(isOpen);
        }}
      >
        <DrawerPortal>
          <DrawerOverlay className="bg-black/50">
            <DrawerContent
              className="border-none [&>div:first-child]:hidden"
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                textAreaRef.current?.focus();
              }}
              onPointerDownOutside={handleInteractOutside}
              onEscapeKeyDown={handleInteractOutside}
              onInteractOutside={handleInteractOutside}
              onAnimationEnd={() => {
                if (!open && isSubmitted.current) {
                  // 提交內容後自動關閉drawer
                  stopLoading();
                  setText("");
                  isSubmitted.current = false;
                }
              }}
            >
              <VisuallyHidden.Root>
                <DrawerHeader>
                  <DrawerTitle></DrawerTitle>
                  <DrawerDescription></DrawerDescription>
                  <DrawerClose></DrawerClose>
                </DrawerHeader>
              </VisuallyHidden.Root>

              <CommentForm
                text={text}
                setText={setText}
                onSubmit={async () =>
                  await submit(text, {
                    mode,
                    queryArgs,
                    commentId: targetId ?? undefined,
                    onSuccess: () => {
                      isSubmitted.current = true;
                      setOpen?.(false);
                    },
                    onFinally: () => {
                      dispatch(
                        resetInput(
                          mode === "edit" ? { keepText: true } : undefined,
                        ),
                      );
                      stopLoading();
                    },
                  })
                }
                onCancel={() => {}}
                ref={textAreaRef}
              />
            </DrawerContent>
          </DrawerOverlay>
        </DrawerPortal>
      </Drawer>
    </>
  );
}

/*
EDIT MODE
按下外面取消 => 出現彈窗問是否要取消編輯?YES的話將input窗關掉、彈窗關閉。NO的話彈窗關閉回到input窗
ADD/REPLY MODE
按下外面 => 回到CommentList彈窗，輸入的內容會顯示在打開button上，關掉CommentList彈窗，inputText自動被清空
*/

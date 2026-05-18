import React, {
  useMemo,
  useEffect,
  forwardRef,
  type Dispatch,
  type SetStateAction,
  useState,
} from "react";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import LoadingButton from "../LoadingButton";
import { useAppSelector } from "@/store";
import { useDeviceWidth } from "@/hooks/useDeviceWidth";
import { useUser } from "@/hooks/useUser";
import { useLoading } from "@/contexts/LoadingContext";

interface CommentFormProps {
  initialValue?: string;
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
}

const CommentForm = forwardRef<HTMLTextAreaElement, CommentFormProps>(
  ({ text, setText, onSubmit, onCancel, initialValue }, ref) => {
    /* globalState */
    const { mode, originalText } = useAppSelector(
      (state) => state.comment,
    );

    /* localState */
    const [showFooter, setShowFooter] = useState<boolean>(false);

    /* hook */
    const { isMobile } = useDeviceWidth(),
      { isLoggedIn, user } = useUser(),
      { startLoading } = useLoading();

    const MAX_INPUT: number = 500;
    const isCountExceed = useMemo(() => {
      return text.length > MAX_INPUT ? true : false;
    }, [text]);

    const disabled = useMemo(() => {
      const isTrimmedEmpty = text?.trim().length === 0;
      const isUnchanged = mode === "edit" && text === originalText; // 在手機編輯模式下如果留言內容沒有變動就讓submit disable
      const isUnchanged2 = initialValue ? text === initialValue : false;

      return isCountExceed || isTrimmedEmpty || isUnchanged || isUnchanged2;
    }, [text, mode, originalText, isCountExceed, initialValue]);

    useEffect(() => {
      if (initialValue) setText(initialValue);
    }, [initialValue, setText]);

    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        const textarea = ref.current;
        const length = textarea.value.length;
        // 將選取範圍的起始與結束都設定為文字的最後一個位置，強迫cursor跳到該index
        textarea.setSelectionRange(length, length);
      }
    }, [ref]);

    /* method */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Backspace") {
        const target = e.target as HTMLTextAreaElement;
        const cursorPosition = target.selectionStart;

        // 取得游標目前位置前面的所有文字
        const textBeforeCursor = text.slice(0, cursorPosition);

        const tagRex = /@[^\s]+\s$/;
        const match = textBeforeCursor.match(tagRex);

        if (match) {
          e.preventDefault(); // 取消只刪除一個字的預設行為

          const newText =
            text.slice(0, cursorPosition - match[0].length) +
            text.slice(cursorPosition);
          setText(newText);
        }
      }
    };
    return (
      <section>
        {/* isMobile */}
        <main
          className={cn("px-4 py-2", "md:flex md:items-center md:gap-6 md:p-0")}
        >
          {/* avatar */}
          {isLoggedIn ? (
            <img
              className={cn(
                "hidden md:block md:size-12.5 md:flex-none md:circle-base",
                initialValue && "md:hidden",
              )}
              alt={user?.name}
              src={user?.pic}
            />
          ) : null}

          {/* input */}
          <Textarea
            name="comment"
            placeholder={
              isLoggedIn
                ? "write a response"
                : "please log in before leaving a message."
            }
            className={cn(
              "no-scrollbar max-h-30 w-full resize-none rounded-base border-none break-all placeholder:text-primary focus:focus-visible:ring-transparent",
              "md:min-h-auto md:rounded-[20px] md:border-base md:border-solid md:bg-secondary md:px-6 md:text-[20px] md:placeholder-shown:text-[20px] md:focus:focus-visible:ring-ring/50 lg:text-[24px] lg:placeholder-shown:text-[24px]",
              "dark:bg-popup-bg-dark",
              initialValue && "mt-4",
            )}
            disabled={!isLoggedIn}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            ref={ref}
            onClick={() => setShowFooter(true)}
            autoFocus={false}
            onKeyDown={handleKeyDown}
          />
        </main>
        {/* wordCount & button group */}
        {(isMobile || (!isMobile && showFooter) || initialValue) && (
          <footer
            className={cn(
              "flex items-center justify-between border-t border-primary/30 px-4 py-2",
              "md:border-t-0 md:px-0",
            )}
          >
            <p className={cn("text-16-20-24 md:pl-24", initialValue && "md:pl-6")}>
              <span
                className={cn(
                  isCountExceed ? "text-destructive" : "text-primary",
                )}
              >
                {text ? text.length : "0"}
              </span>{" "}
              / {MAX_INPUT}
            </p>
            <section className="flex gap-5">
              <Button
                variant="outline"
                size={null}
                className={cn(
                  "hidden rounded-full px-9 py-1 text-16-20-24",
                  "md:block",
                )}
                onClick={() => {
                  onCancel();
                  if (!isMobile) setShowFooter(false);
                }}
              >
                Cancel
              </Button>
              <LoadingButton
                className={cn(
                  "h-auto cursor-pointer rounded-full bg-primary px-5 py-1 text-text-dark disabled:bg-primary/90",
                  "md:px-9",
                )}
                disabled={disabled}
                size={null}
                onClick={async () => {
                  startLoading();
                  await onSubmit(text);
                }}
              >
                Post
              </LoadingButton>
            </section>
          </footer>
        )}
      </section>
    );
  },
);

export default CommentForm;

/*
disable submit button的時機：
1. 字數超過限制
2. 編輯模式：字跟原本的字不一樣
3. 字數 = 0
*/

/*
CommentForm一定要有的東西：
 1. Textarea
 2. SubmitButton(LoadingButton)
 3. CancelButton
 4. 字數顯示
*/

/*
footer在什麼狀況下會顯示？
1. isMobile
2. !isMobile && showFooter
*/

/*
有initialValue代表是在>md尺寸下進入編輯模式
*/

/*
selectionStart & selectionEnd
將textarea 裡的文字想像成一個 字元陣列。selectionStart 就是游標目前所在的索引值 (Index)
* 如果文字是 "Hello"，游標在 H 前面，selectionStart 是 0
* 如果文字是 "Hello"，游標在 o 後面，selectionStart 是 5
* 如果選取了 "ell"，selectionStart 會是 1，而 selectionEnd 會是 4
*/

/*
TS 型別守衛(Type Guard)
key in object
React中，ref可能有兩種形式：
1. 物件形式：useRef()建立的{ current: ... }
2. 函式形式(callback ref)：<div ref={(el) => console.log(el)}
當用forward轉發ref時，以上兩種形式都有可能，TS並無法確定是哪一種
如果直接寫ref.current會報錯 => 萬一ref是一個函式，就沒有.current屬性

"current" in ref => 確認ref中有沒有叫current的屬性
可以用useImperativeHandle來自定義父元件透過ref拿到的是什麼東西
*/

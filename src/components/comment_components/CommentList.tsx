/* UI */
import { VisuallyHidden } from "radix-ui";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { X, ChevronLeft, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CommentItem from "@/components/comment_components/CommentItem";
import CommentInputDrawer from "./CommentInputDrawer";
import CommentForm from "./CommentForm";
import Empty from "@/components/Empty";
import Error from "@/components/Error";
import LoadMore from "@/components/LoadMore";
/* utility & hook */
import { cn } from "@/lib/utils";
import { useDeviceWidth } from "@/hooks/useDeviceWidth";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useDialog } from "@/contexts/DialogContext";
import { useCommentSubmit } from "@/hooks/useCommentSubmit";
import { useLoading } from "@/contexts/LoadingContext";
/* redux */
import { useAppDispatch, useAppSelector } from "@/store";
import { setText as setInputText } from "@/store/features/commentSlice";
import { useGetCommentsQuery } from "@/store/features/api/commentApiSlice";
import type { GetCommentsParams, IComment } from "@/types/comment";

import { useParams } from "react-router-dom";
import { CommentProvider } from "@/contexts/providers/CommentProvider";

interface CommentListProps {
  open: boolean; // 開啟/關閉留言區
  setOpen: Dispatch<SetStateAction<boolean>>;
  parentCommentId?: string | null;
  parentData?: IComment;
}

const MAX_LIMIT: number = 6;

export default function CommentList({
  open,
  setOpen,
  parentCommentId,
  parentData,
}: CommentListProps) {
  /* Hook */
  const { openDialog } = useDialog(),
    { isMobile } = useDeviceWidth(),
    { stopLoading } = useLoading(),
    { submit } = useCommentSubmit(),
    params = useParams();

  const isReply = !!parentCommentId;

  /* GlobalState */
  const dispatch = useAppDispatch(),
    { text: inputText } = useAppSelector((state) => state.comment); // Mobile => Comment Input text is global

  /* LocalState */
  const [inputOpen, setInputOpen] = useState<boolean>(false), // Mobile => open / close input drawer
    [text, setText] = useState<string>(""), // Tablet/Desktop =>  Comment Input text is local
    [queryParams, setQueryParams] = useState<GetCommentsParams>({
      offset: 0,
      limit: MAX_LIMIT,
      sort: "newest",
      newsId: params.id ?? "",
      parentCommentId: parentCommentId ?? null,
    });

  // fetch data
  const { data, isLoading, isFetching, isError, isSuccess } =
    useGetCommentsQuery(queryParams, { skip: !params.id || !open });

  // 渲染內容
  let commentList, content;
  if (isLoading) {
    commentList =  (
      <div className="flex flex-col gap-10 p-base md:px-0 md:gap-15">
        {Array.from({ length: 4 }, (_val, i) => i).map((index) => {
          return (
            <section key={index}>
              {/* meta */}
              <div className="flex items-center gap-4 md:gap-10">
                <Skeleton className="size-6 rounded-full md:size-12.5" />
                <Skeleton className="h-5 w-[40%] md:h-6 lg:h-8" />
              </div>
              {/* content */}
              <div>
                <Skeleton className="mt-4 h-5 w-full md:h-6 lg:h-8" />
                <Skeleton className="mt-1 mb-7.5 h-5 w-full md:h-6 lg:h-8 lg:mt-2" />
              </div>

              {/* reaction */}
              <div className="flex gap-5 md:gap-10">
                <Skeleton className="h-5 w-12 md:h-6 md:w-15 lg:h-8" />
                <Skeleton className="h-5 w-12 md:h-6 md:w-15 lg:h-8" />
                <Skeleton className="h-5 w-12 md:h-6 md:w-15 lg:h-8" />
              </div>
            </section>
          );
        })}
      </div>
    );
    content = commentList;
  } else if (isError) {
    return <Error />;
  } else if (isSuccess) {
    commentList = (
      <>
        {data.commentList.length === 0 ? (
          <Empty
            title={`No ${isReply ? "Replies" : "Comments"} Yet`}
            description={`Be the first to leave a ${isReply ? "reply" : "comment"}.`}
            Icon={MessageCircle}
            className="w-full mb-15"
          />
        ) : (
          <>
            {data.commentList.map((item) => (
              <CommentItem
                key={item._id}
                data={item}
                role={isReply ? "reply" : "main"}
                setInputOpen={setInputOpen}
                setText={setText}
              />
            ))}
            <LoadMore
              isFetching={isFetching}
              isLoading={isLoading}
              hasMore={data?.hasMore ?? false}
              dataLength={data?.commentList.length ?? 0}
              onLoadMore={() => {
                setQueryParams((prev) => ({
                  ...prev,
                  offset: (prev.offset ?? 0) + (prev.limit ?? MAX_LIMIT),
                }));
              }}
              className={cn("py-0 md:py-8",isReply && "md:py-0")}
            />
          </>
        )}
      </>
    );
    content = (
      <section
        className={cn(
          isMobile && "no-scrollbar flex-1 overflow-y-scroll min-h-[62vh]",
          !isMobile && isReply && "mt-10 flex pl-4",
        )}
      >
        {/* parentComment */}
        <div
          className={cn(
            isMobile && isReply ? "block" : "hidden",
            "bg-primary/20 p-base py-6",
          )}
        >
          {parentData && <CommentItem data={parentData} role="head" />}
        </div>

        <div
          className={cn(
            "w-full",
            isMobile && "p-base",
            isMobile
              ? isReply
                ? "flex"
                : "block"
              : isReply
                ? "flex pl-4"
                : "block",
          )}
        >
          {/* replies左邊的線 */}
          <div
            className={cn("w-1 bg-primary/50", isReply ? "block" : "hidden")}
          ></div>

          <section
            className={cn(
              "flex flex-col gap-10 md:gap-15",
              isReply ? (isMobile ? "w-full pl-4" : "w-full pl-8") : "",
            )}
          >
            <div className={cn("hidden", !isMobile && "block")}>
              <CommentForm
                text={text}
                setText={setText}
                onSubmit={async () =>
                  await submit(text, {
                    mode: isReply ? "reply" : "add",
                    queryArgs: queryParams,
                    onFinally: () => {
                      stopLoading();
                      setText("");
                    },
                  })
                }
                onCancel={() => setText("")}
              />
            </div>

            {commentList}
          </section>
        </div>
      </section>
    );
  }

  return (
    <CommentProvider queryArgs={queryParams} setQueryArgs={setQueryParams}>
      {open && !isMobile && content}

      {isMobile && (
        <Drawer
          open={open}
          onOpenChange={setOpen}
          repositionInputs={false}
          direction={isReply ? "right" : "bottom"}
        >
          <DrawerContent>
            <DrawerHeader
              className={cn(
                "flex-row border-b border-primary py-2",
                isReply ? "gap-4" : "justify-between",
              )}
            >
              <DrawerTitle
                className={cn("text-[24px]", isReply ? "order-2" : "order-1")}
              >
                {isReply ? "Reply" : "Comment"}
              </DrawerTitle>
              <DrawerClose
                asChild
                className={cn(isReply ? "order-1" : "order-2")}
              >
                <button
                  className="self-center hover:cursor-pointer"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    if (isReply) {
                      e.preventDefault();
                      if (inputText.length !== 0) {
                        openDialog({
                          title: "Discard comment?",
                          confirmText: "Discard",
                          cancelText: "Keep writing",
                          onConfirm: () => {
                            dispatch(setInputText(""));
                            setOpen(false);
                          },
                        });
                      } else {
                        setOpen(false);
                      }
                    }
                  }}
                >
                  {isReply ? <ChevronLeft /> : <X />}
                </button>
              </DrawerClose>
              <VisuallyHidden.Root>
                <DrawerDescription></DrawerDescription>
              </VisuallyHidden.Root>
            </DrawerHeader>

            {content}

            <DrawerFooter className="border-t border-primary">
              <CommentInputDrawer
                open={inputOpen}
                setOpen={setInputOpen}
                replyMode={isReply}
              />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </CommentProvider>
  );
}

/*
目前問題：
手機版的CommentInput同一時間只會出現一個，所以可以用redux全域狀態來管理輸入框文字
桌機版的CommentInput同一時間會出現多個，所以必須用區域狀態來管理輸入框文字
*/

/*
未來要加的東西：
  1. isLoading的狀態
    skeleton
    沒有留言 => 現在留言為空 / 沒有更多回覆！
  2. desktop版本的spinner要不要改成更多回覆的按鈕？
*/

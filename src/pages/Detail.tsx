import {
  CircleAlert,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Bell,
  MessageCircle,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState, useRef } from "react";
import Header from "@/components/Header";
import fallbackImage from "@/assets/image/fallback-image.png";
import CommentList from "@/components/comment_components/CommentList";
// import DiscardConfirmProvider from "@/contexts/providers/DialogProvider";
import { cn } from "@/lib/utils";
import {
  getErrorMessage,
  getformatTimeObject,
  toastError,
  formatPlainTextBody,
} from "@/assets/utils";

import DOMPurify from "dompurify";
import type { RouteComponentProps } from "@/router";
import { useUser } from "@/hooks/useUser";
import { useDeviceWidth } from "@/hooks/useDeviceWidth";
import { Link } from "react-router-dom";
import { useGetNewsDetailQuery } from "@/store/features/api/newsApiSlice";
import {
  useCheckFavoriteQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from "@/store/features/api/favoritesApiSlice";
import {
  useCheckSubscribeQuery,
  useSubscribeMutation,
  useUnsubscribeMutation,
} from "@/store/features/api/subscriptionApiSlice";
import Error from "@/components/Error";
import ScrollToTop from "@/components/ScrollToTop";

export default function Detail({
  navigate,
  params,
  location,
}: RouteComponentProps<"id">) {
  const bottomRef = useRef<HTMLDivElement>(null);
  /* LocalState */
  const [isCommentOpen, setIsCommentOpen] = useState<boolean>(false),
    [visible, setVisible] = useState<boolean>(false);

  /* GlobalState */
  const { isLoggedIn } = useUser(),
    { isMobile } = useDeviceWidth();

  /* RTK Query */
  const { data, isError, isLoading, isSuccess } = useGetNewsDetailQuery(
      params.id ?? "",
    ),
    { data: checkFav } = useCheckFavoriteQuery(params.id!, {
      skip: !isLoggedIn || !params.id,
    }),
    { data: checkSub } = useCheckSubscribeQuery(data?.source.id ?? "", {
      skip: !isLoggedIn || !data?.source.id,
    });

  const [addToFavorites] = useAddToFavoritesMutation(),
    [removeFromFavorites] = useRemoveFromFavoritesMutation(),
    [subscribe] = useSubscribeMutation(),
    [unsubscribe] = useUnsubscribeMutation();

  const formattedBody =
    data?.source.id === "the-guardian"
      ? data?.body
      : formatPlainTextBody(data?.body);
  const isStored = checkFav?.isFavorited ?? false;
  const isSubscribed = checkSub?.subscribed ?? false;

  // page title
  useEffect(() => {
    if (data?.title) {
      document.title = `${data.title} - Daily News`;
    }
  }, [data?.title]);
  // time
  const publishTime = useMemo(() => {
    if (data?.publishedAt) {
      return getformatTimeObject(data?.publishedAt);
    }
  }, [data?.publishedAt]);
  // 滑到最底部時，bottombar消失（isMobile）
  useEffect(() => {
    let ob: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        setVisible(!entries[0].isIntersecting);
      },
      {
        root: null,
        threshold: 0, // 只要標記的 1px 進入畫面就會觸發
      },
    );
    const current = bottomRef.current;
    if (current) ob.observe(current);

    return () => {
      if (current) ob?.unobserve(current);
      ob = null;
    };
  }, []);

  /* Event Handler */
  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      toastError("Please login first.");
      navigate(`/login?to=${location.pathname}`, { replace: true });
      return;
    }

    try {
      if (isStored) {
        // 移除收藏
        await removeFromFavorites(params.id ?? "").unwrap(); // RTK Query的mutation回傳要用.unwrap()來取得結果或捕捉錯誤
        toast.success(`Removed from favorites.`, {
          // unwrap()成功才會執行到這，失敗會throw被catch捕捉
          position: "top-center",
        });
      } else {
        // 加入收藏
        await addToFavorites(params.id ?? "").unwrap();
        toast.success("Added to favorites.", {
          position: "top-center",
        });
      }
    } catch (error) {
      toastError("Action Failed", getErrorMessage(error));
    }
  };

  const toggleSubscribe = async () => {
    if (!isLoggedIn) {
      toastError("Please login first.");
      navigate(`/login?to=${location.pathname}`, { replace: true });
      return;
    }
    try {
      if (isSubscribed) {
        // 移除收藏
        await unsubscribe(data?.source.id ?? "").unwrap();
        toast.success(`Unsubscribe successfully.`, {
          position: "top-center",
        });
      } else {
        // 加入收藏
        await subscribe({
          sourceName: data?.source.name ?? "",
          sourceId: data?.source.id ?? "",
        }).unwrap();
        toast.success("Subscribe successfully.", {
          position: "top-center",
        });
      }
    } catch (error) {
      toastError("Action Failed", getErrorMessage(error));
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href); // 複製網址到剪貼簿
      toast.success(`Link copied to clipboard!`, {
        position: "top-center",
      });
    } catch {
      // 部分就瀏覽器不支援clipboard API
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      toast.success(`Link copied to clipboard!`, {
        position: "top-center",
      });
    }
  };

  // 渲染內容
  let content;
  if (isLoading) {
    content = (
      <div className="main-bg">
        {/* header */}
        <header className="col-span-full hidden md:order-1 md:block">
          <Header />
        </header>

        <div className="flex flex-col">
          {/* banner */}
          <div className={cn("order-1", "md:order-3 md:p-base md:pt-0")}>
            <Skeleton
              className={cn("aspect-video w-full rounded-none md:rounded-base")}
            />
          </div>

          {/* title */}
          <div
            className={cn(
              "order-2 flex flex-col gap-3 p-base py-5",
              "md:order-1 md:gap-5",
            )}
          >
            <Skeleton className={cn("h-7 w-full", "md:h-13", "lg:h-15")} />
            <Skeleton className={cn("h-7 w-full", "md:h-13", "lg:h-15")} />
            <Skeleton className={cn("h-7 w-[80%]", "md:h-13", "lg:h-15")} />
          </div>

          {/* meta */}
          <div
            className={cn(
              "order-3 flex flex-col gap-1 p-base py-6",
              "md:order-2 md:gap-3",
            )}
          >
            <Skeleton className={cn("h-4 w-[50%]", "md:h-6", "lg:h-8")} />
            <Skeleton className={cn("h-4 w-[60%]", "md:h-6", "lg:h-8")} />
          </div>
        </div>

        {/* content */}
        <div className="flex flex-col gap-4 p-base">
          {Array.from({ length: 20 }).map((val, i) => (
            <Skeleton className={cn("h-5", "md:h-6")} key={i} />
          ))}
        </div>
      </div>
    );
  } else if (isError) {
    return <Error />;
  } else if (isSuccess) {
    content = (
      <div className="main-bg grid grid-cols-1 md:grid-cols-12">
        {/* header */}
        <header className="col-span-full hidden md:order-1 md:block">
          <Header />
        </header>

        {/* banner */}
        <section className="order-1 col-span-full md:order-5 md:p-base md:pt-0">
          <img
            className="aspect-video w-full bg-primary/50 object-cover md:rounded-base md:border-base"
            src={data?.urlToImage || fallbackImage}
            alt={data?.title}
            loading="lazy"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }}
          />
        </section>

        {/* title */}
        <section className="order-2 col-span-full w-full bg-primary p-base py-5 md:order-2 md:bg-transparent">
          <h1
            lang="en"
            className={cn(
              "text-[28px] leading-9 font-bold tracking-[-0.02em] text-pretty hyphens-auto text-text-dark",
              "md:text-[clamp(48px,30.6px+2.32vw,60px)] md:leading-16 md:font-medium md:text-text-light lg:leading-18",
              "dark:md:text-text-dark",
            )}
          >
            {data?.title}
          </h1>
        </section>

        {/* meta */}
        <section className="order-3 col-span-full p-base py-6 text-14-20-24 md:order-3 md:col-span-7">
          <p>
            By <span className="italic">{data?.author}</span>
          </p>
          <p>
            Published at{" "}
            <span className="italic">
              {publishTime?.month} {publishTime?.day} , {publishTime?.year}
            </span>
          </p>
        </section>

        {/* content */}
        <section className="order-4 col-span-full p-base md:order-6">
          {data?.body && (
            <article
              className={cn(
                "prose prose-lg max-w-none",
                "prose-headings:text-primary",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                "prose-img:w-full prose-img:rounded-base",
                "prose-figure:my-8",
                "prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground",
                "prose-p:text-16-20-24 prose-p:leading-8 prose-p:text-pretty prose-p:hyphens-auto",
                "lg:prose-p:leading-10.5",
                "dark:prose-p:text-text-dark dark:prose-strong:text-text-dark",
              )}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(formattedBody),
              }}
            />
          )}
        </section>

        {/* warn */}
        <section className="order-5 col-span-full my-6.75 p-base md:order-7">
          <div className="flex flex-col items-center gap-5 rounded-base border-base px-5 py-4 md:py-6">
            <div className="flex items-start gap-2.5 md:items-center md:gap-5">
              <CircleAlert className="size-10 shrink-0 text-primary md:size-15" />
              <p className="self-center text-16-20-24 text-primary">
                Note: This content is automatically retrieved and may be
                incomplete.
              </p>
            </div>

            <Link to={`${data?.url}`} className="w-full md:max-w-100">
              <Button className="h-12 w-full rounded-full dark:text-text-dark">
                View original source
              </Button>
            </Link>
          </div>
        </section>

        {/* subscription */}
        <section className="order-6 col-span-full md:order-4 md:col-span-5">
          {/* container */}
          <div
            className={cn(
              "grid w-full grid-cols-[1fr_5fr_auto] items-center gap-x-5 bg-primary/10 px-5 py-6",
              "md:h-full md:grid-cols-[auto_1fr_auto] md:gap-y-2 md:bg-transparent md:pr-8 md:pl-0 lg:pr-22",
            )}
          >
            {/* avatar */}
            <div className="aspect-square w-full max-w-20 circle-base md:size-10"></div>
            {/* source name */}
            <h6 className="line-clamp-1 text-[24px] md:text-20-24">
              {data?.source.name}
            </h6>
            {/* subscribe button */}
            <Button
              variant={isSubscribed ? "secondary" : "outline"}
              className="max-w-50 rounded-full p-5 max-md:flex-1 md:h-10 lg:text-[24px]"
              onClick={toggleSubscribe}
            >
              <Bell
                className={cn(
                  "size-5",
                  isSubscribed ? "fill-white dark:text-white" : "fill-none",
                )}
              />
            </Button>
          </div>
        </section>

        {/*Interaction */}
        <section className="order-8 col-span-full">
          <div
            className={cn(
              "fixed bottom-0 flex h-15 w-full items-center justify-around rounded-base bg-secondary shadow-t",
              !visible && isMobile
                ? "pointer-events-none translate-y-full opacity-0"
                : "translate-y-0 opacity-100",
              "md:pointer-events-auto md:static md:my-8.5 md:mb-13 md:translate-y-0 md:gap-6 md:bg-transparent md:px-8 md:opacity-100 md:shadow-none",
              "lg:gap-7 lg:px-25",
            )}
          >
            <div className="hidden h-px w-full bg-primary md:block"></div>
            {/* back */}
            <span
              className="flex flex-1 cursor-pointer justify-center border-r border-r-primary md:hidden"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="size-7.5 text-primary" />
            </span>
            {/* comments */}
            <span
              className={cn(
                "flex flex-1 justify-center border-r border-r-primary",
                "md:flex-none md:items-center md:gap-2 md:rounded-[50px] md:border-base md:px-9 md:py-5",
                "group cursor-pointer md:hover:bg-primary",
              )}
              onClick={() => setIsCommentOpen(!isCommentOpen)}
            >
              <MessageCircle className="size-7.5 text-primary md:size-8 md:group-hover:text-text-dark" />
              <span className="hidden text-20-24 text-primary md:block md:group-hover:text-text-dark">
                Comments (20)
              </span>
              {isCommentOpen ? (
                <ChevronUp className="hidden size-8 text-primary md:block md:group-hover:text-text-dark" />
              ) : (
                <ChevronDown className="hidden size-8 text-primary md:block md:group-hover:text-text-dark" />
              )}
            </span>
            {/* collect */}
            <span
              className={cn(
                "group flex flex-1 justify-center border-r border-r-primary",
                "cursor-pointer md:flex-none md:rounded-full md:border-base md:p-6",
                "md:hover:bg-primary md:hover:text-text-dark",
                isStored ? "md:bg-primary" : "bg-transparent",
              )}
              onClick={toggleFavorite}
            >
              <Star
                className={cn(
                  "size-7.5 text-primary md:group-hover:text-text-dark",
                  isStored
                    ? "fill-primary md:fill-secondary md:text-secondary!"
                    : "fill-none",
                )}
              />
            </span>
            {/* share */}
            <span
              className={cn(
                "group flex flex-1 justify-center",
                "cursor-pointer md:flex-none md:rounded-full md:border-base md:p-6",
                "md:hover:bg-primary",
              )}
              onClick={share}
            >
              <ExternalLink
                className={cn(
                  "size-7.5 text-primary",
                  "md:group-hover:text-text-dark",
                )}
              />
            </span>
            <div className="hidden h-px w-full bg-primary md:block"></div>
          </div>
        </section>

        {/* Comment */}
        <section className="order-9 col-span-full px-5 md:block md:px-8 lg:px-25">
          <CommentList
            open={isCommentOpen}
            setOpen={setIsCommentOpen}
            // isReply={false}
          />
        </section>
      </div>
    );
  }
  return (
    <>
      {content}
      {!isMobile && <ScrollToTop />}
      <div
        ref={bottomRef}
        className="h-px w-full bg-transparent"
        aria-hidden="true"
      ></div>
    </>
  );
}

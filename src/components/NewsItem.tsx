import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import type { INews } from "@/types/news";
import { Link } from "react-router-dom";
import HighlightText from "./HighlightText";
import fallbackImage from "@/assets/image/fallback-image.png";
import { formatRelativeTime } from "@/assets/utils";

interface NewsItemProps {
  info:
    | INews
    | Omit<INews, "externalId" | "author" | "url" | "createdAt" | "body">;
  variant?: "default" | "card" | "search" | "portrait";
  highlight?: string;
  onRemove?: (newsId: string) => Promise<void>;
}

export default function NewsItem({
  variant = "default",
  info,
  highlight,
  onRemove,
}: NewsItemProps) {
  const isDefault = variant === "default",
    isCard = variant === "card",
    isSearch = variant === "search",
    isPortrait = variant === "portrait";

  const title = (
    <h2
      className={cn(
        "line-clamp-2",
        isDefault && "col-start-1 row-start-1 self-start text-16-24",
        isCard && "order-2 w-full text-[24px] text-balance",
        isSearch &&
          "col-span-2 col-start-1 row-start-1 text-20-24-28! font-bold text-primary underline-offset-6 hover:underline",
        isPortrait && "line-clamp-3 order-2 text-[24px] text-pretty",
      )}
    >
      {highlight ? (
        <HighlightText text={info.title} keyword={highlight} />
      ) : (
        info.title
      )}
    </h2>
  );

  const content = (
    <div
      className={cn(
        "grid px-5 py-2.5 md:rounded-base",
        isDefault &&
          "left-to-right dark:left-to-right-dark h-25 w-full grid-cols-[1fr_auto] grid-rows-[1fr_auto] items-center gap-5 hover:shadow-[0_4px_8px] hover:shadow-primary/25 md:mb-5 md:h-40 md:p-5 lg:h-45 lg:gap-10",
        isCard &&
          "mb-0 h-auto grid-rows-[1fr_auto_auto_auto] px-0 py-0 md:gap-5",
        isSearch &&
          "relative grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-5 gap-y-2 py-5 after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-[90vw] after:-translate-x-1/2 after:bg-primary/50 md:gap-y-5 md:py-7 md:after:w-full lg:py-10",
        isPortrait && "grid-rows-[1fr_auto_auto] px-3 py-4 md:p-5 rounded-base gap-2 md:gap-5 hover:bg-primary/10",
      )}
    >
      {/* Image */}
      <img
        className={cn(
          "shrink-0 bg-primary md:rounded-base",
          isDefault &&
            "col-start-2 row-span-2 row-start-1 size-18 justify-self-end object-cover md:h-full md:w-40 lg:w-50",
          isCard && "order-1 min-h-40 w-full",
          isSearch &&
            "col-start-2 row-start-2 size-20 object-cover md:h-full md:w-30 lg:w-35",
          isPortrait && "order-1 aspect-video md:aspect-auto md:min-h-40 w-full rounded-base object-cover",
        )}
        src={info.urlToImage || fallbackImage}
        loading="lazy"
        alt={info.title}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackImage;
        }}
      />

      {/* title  */}
      {isSearch ? (
        <Link to={`/detail/${info._id}`} className="contents">
          {title}
        </Link>
      ) : (
        <>{title}</>
      )}

      {/* description */}
      <p
        className={cn(
          "text-muted-foreground!",
          isDefault && "hidden",
          isCard &&
            "display-webkit-box order-3 line-clamp-6 w-full text-pretty",
          isSearch &&
            "col-start-1 row-start-2 line-clamp-4 text-16-20 leading-5 md:leading-8",
          isPortrait && "hidden"
        )}
      >
        {highlight ? (
          <HighlightText text={info.description} keyword={highlight} />
        ) : (
          info.description
        )}
      </p>

      {/* source & category */}
      <section
        className={cn(
          "flex items-center",
          isDefault && "col-start-1 row-start-2",
          isCard && "order-4 mb-5 gap-5",
          isSearch && "hidden",
          isPortrait && "order-3 text-16-20",
        )}
      >
        <div
          className={cn("hidden", isCard && "block size-10 circle-base")}
        ></div>

        <p className="flex text-12-16-20 text-primary">
          <span className={cn("line-clamp-1", isCard && "hidden",isPortrait && "lg:text-[16px]")}>
            {info.category.toUpperCase()} ／ 
          </span>

          <span className={cn("line-clamp-1", isPortrait && "hidden")}>
            {info.source.name}
          </span>

          <span className={cn("hidden", isPortrait && "block lg:text-[16px]")}>
            {formatRelativeTime(info.publishedAt)}
          </span>
        </p>
      </section>
    </div>
  );

  if (isDefault || isPortrait) {
    return <Link to={`/detail/${info._id}`}>{content}</Link>;
  } else if (isCard) {
    return (
      <div className="w-full rounded-base p-5 hover:bg-primary/10">
        <Link to={`/detail/${info._id}`}>{content}</Link>

        {/* Remove Favorite button */}
        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={() => onRemove?.(info._id)}
        >
          Remove
        </Button>
      </div>
    );
  }

  return content;
}


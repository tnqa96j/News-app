import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { type CarouselApi } from "@/components/ui/carousel";

import { cn } from "@/lib/utils";
import { useDeviceWidth } from "@/hooks/useDeviceWidth";
import { type INews } from "@/types/news";
import { Link } from "react-router-dom";
export default function CarouselBanner({ data }: { data: INews[] }) {
  /*   const banner_data = [
    {
      id: 1,
      title:
        "Trump abandons attack mode as Minneapolis shooting backlash grows",
      source: "BBC",
      imgUrl:
        "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
    },
    {
      id: 2,
      title: "Second News Title...",
      source: "CNN",
      imgUrl:
        "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
    },
    {
      id: 3,
      title: "Third News Title...",
      source: "Reuters",
      imgUrl:
        "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
    },
    {
      id: 4,
      title: "Fourth News Title...",
      source: "AP",
      imgUrl:
        "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
    },
  ]; */
  const delay = 2000;

  const [api, setApi] = useState<CarouselApi>(),
    [current, setCurrent] = useState(0),
    [count, setCount] = useState(0),
    [isPaused, setIsPaused] = useState(false),
    { isMobile } = useDeviceWidth();

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);

    const autoplay = api.plugins()?.autoplay;
    const onPlay = () => setIsPaused(false);
    const onStop = () => setIsPaused(true);

    if (autoplay) {
      api.on("autoplay:play", onPlay);
      api.on("autoplay:stop", onStop);
    }

    return () => {
      api.off("select", onSelect);
      if (autoplay) {
        api.off("autoplay:play", onPlay);
        api.off("autoplay:stop", onStop);
      }
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true, align: "center", containScroll: false }}
      plugins={[
        Autoplay({
          delay: delay,
          stopOnInteraction: false,
          stopOnMouseEnter: !isMobile,
          stopOnFocusIn: false,
          stopOnLastSnap: false,
        }),
        Fade(),
      ]}
    >
      <CarouselContent className="relative h-93.75 md:h-90 lg:h-100">
        {data.map((item) => (
          <CarouselItem key={item._id} id={item._id}>
            <Link
              className={cn(
                "relative flex size-full flex-col justify-end px-5 leading-6",
                "md:justify-center md:rounded-base md:border-base",
                "banner-gradient before:absolute before:inset-0 before:z-0 md:before:rounded-base",
              )}
              to={{ pathname: `/detail/${item._id}` }}
            >
              <img
                src={item.urlToImage}
                loading="lazy"
                alt={item.title}
                className="pointer-events-none absolute inset-0 -z-10 size-full object-cover select-none md:rounded-base"
              />
              <h2 className="relative z-10 mb-2 line-clamp-5 min-w-0 text-[24px] text-text-dark md:ml-5 md:w-[50%] md:text-[clamp(36px,22.96px+1.74vw,48px)] md:leading-[clamp(40px,29.13px+1.45vw,50px)] lg:ml-11">
                {item.title}
              </h2>
              <p className="relative z-10 mb-10 text-text-dark md:mb-0 md:mt-2 md:ml-5 lg:ml-11">
                <span>
                  {item.category.slice(0, 1).toUpperCase() +
                    item.category.slice(1, item.category.length)}
                  {"  "}
                  News
                </span>
                {"  "}／{"  "}
                <span>{item.source.name}</span>
              </p>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* dot indicator */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {Array.from({ length: count }).map((_, index) => {
          const isActive = current === index;
          return (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "relative h-1 cursor-pointer overflow-hidden rounded-full bg-white/30 transition-all duration-300",
                isActive ? "w-8 md:w-16" : "w-2 md:w-4",
              )}
            >
              {/* 進度條 */}
              {isActive && (
                <div
                  key={`progress-${index}-${current}-${isPaused}`}
                  className="absolute inset-y-0 left-0 bg-white"
                  style={{
                    animation: `progress ${delay}ms linear forwards`,
                    animationPlayState: isPaused ? "paused" : "running",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </Carousel>
  );
}

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ArrowUpToLine } from "lucide-react";
import { cn } from "@/lib/utils";
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      size="icon-lg"
      className={cn(
        "fixed right-5 bottom-5 z-1000 size-12 shadow-b rounded-full border border-primary transition-all duration-300 md:size-15 lg:size-18",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-5 opacity-0",
      )}
      onClick={scrollToTop}
    >
      <ArrowUpToLine className="size-5 md:size-7 lg:size-8 dark:text-text-dark" />
    </Button>
  );
}

/*
不是在最上面時 => 元件出現
點擊 => scroll to top => 元件消失
*/

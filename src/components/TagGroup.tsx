import { cn } from "@/lib/utils";
interface TagGroupProps {
  tags: string[];
  selectedTag: string;
  onTagClick: (tag: string) => void;
  containerClassName?: string; // tags container樣式
  tagClassName?: string;
  activeClassName?: string;
}
export default function TagGroup({
  tags,
  selectedTag,
  onTagClick,
  containerClassName,
  tagClassName,
  activeClassName,
}: TagGroupProps) {
  return (
    <section
      className={cn(
        "scrollbar-hide flex items-center overflow-x-scroll md:flex-wrap",
        containerClassName,
      )}
    >
      {tags.map((item, index) => {
        const isActive = selectedTag === item;
        return (
          <button
            key={index}
            onClick={() => onTagClick(item)}
            className={cn(
              "hover-base cursor-pointer capsule-base md:text-[20px]",
              "dark:border-text-dark dark:text-text-dark",
              "dark:md:hover-base",
              tagClassName,
              isActive &&
                cn(
                  "border-primary text-primary",
                  "dark:md:border-primary dark:md:text-primary",
                  activeClassName,
                ),
            )}
          >
            {item.toUpperCase()}
          </button>
        );
      })}
    </section>
  );
}

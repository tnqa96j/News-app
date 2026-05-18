import { escapeRegex } from "@/assets/utils";
interface HighlightTextProps {
  text: string;
  keyword: string;
  className?: string;
}
export default function HighlightText({
  text,
  keyword,
  className,
}: HighlightTextProps) {
  if (!keyword.trim()) return <span>{text}</span>;

  // 用regex將文字切成「匹配的」和「不匹配的」兩種片段
  const regex = new RegExp(`(${escapeRegex(keyword)})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="rounded-sm bg-yellow-200/50 dark:bg-yellow-950 px-0.5 text-primary/90 font-bold"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  );
}

// 用regex將文字切成「匹配的」和「不匹配的」兩種片段
/*   const regex = new RegExp(`(${escapeRegex(keyword)})`,"gi");
  const parts = text.split(regex); */
// 例如 "Apple releases new AI"，keyword = "AI"
// parts = ["Apple releases new ", "AI", ""]

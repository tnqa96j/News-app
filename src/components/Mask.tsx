import { cn } from "@/lib/utils";

interface DotLoadingProps {
  className?: string;
  color?: string;
}

interface MaskProps {
  open?: boolean;
  children?: React.ReactNode;
  className?: string;
  opacity?: "light" | "default" | "thick";
  fixed?: boolean; // true：覆蓋全螢幕，false：覆蓋父容器
}

export const DotLoading = ({ className, color }: DotLoadingProps) => {
  return (
    <div className={cn("flex items-center space-x-1.5", className)}>
      <div
        className={cn(
          "h-2.5 w-2.5 animate-bounce rounded-full bg-amber-50 [animation-delay:-0.3s]",
          color,
        )}
      />
      <div
        className={cn(
          "h-2.5 w-2.5 animate-bounce rounded-full bg-amber-50 [animation-delay:-0.15s]",
          color,
        )}
      />
      <div
        className={cn(
          "h-2.5 w-2.5 animate-bounce rounded-full bg-amber-50",
          color,
        )}
      />
    </div>
  );
};
// 利用 [animation-delay:-0.3s]，讓三個點產生時間差的跳動效果
export const Mask = ({
  open = true,
  children,
  className,
  opacity = "default",
  fixed = true,
}: MaskProps) => {
  if (!open) return null;

  const opacityVariants = {
    light: "bg-background/40 backdrop-blur-sm",
    default: "bg-background/60 backdrop-blur-sm",
    thick: "bg-black/80",
  };
  return (
    <div
      className={cn(
        "z-100 flex items-center justify-center",
        fixed ? "fixed inset-0" : "absolute inset-0",
        opacityVariants[opacity],
        className,
      )}
    >
      {children}
    </div>
  );
};

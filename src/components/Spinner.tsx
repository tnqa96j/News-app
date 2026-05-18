/* 封裝spinner */
import { Loader2, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends LucideProps {
  className?: string;
}

export const Spinner = ({ className, ...props }: SpinnerProps) => {
  return <Loader2 className={cn("animate-spin", className)} {...props} />;
};

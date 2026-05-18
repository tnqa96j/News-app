import {
  Empty as EmptyContainer,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Newspaper, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
interface EmptyProps {
  Icon?: LucideIcon;
  title?: string;
  description: string;
  className?: string;
}

export default function Empty({
  Icon = Newspaper,
  title = "No News Found",
  description,
  className,
}: EmptyProps) {
  return (
    <EmptyContainer className={cn("h-screen", className)}>
      <EmptyHeader>
        <EmptyMedia className="h-20" variant="icon">
          <Icon className="size-20 text-primary/70" />
        </EmptyMedia>
        <EmptyTitle className="text-24-32-40! text-primary">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </EmptyContainer>
  );
}

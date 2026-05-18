import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { GlobeX } from "lucide-react";

export default function Error() {
  return (
    <>
      <Empty className="main-bg gap-8">
        <EmptyHeader>
          <EmptyMedia className="h-20" variant="icon">
            <GlobeX className="size-20 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="text-24-32-40! font-bold text-primary">
            Error Occurred
          </EmptyTitle>
          <EmptyDescription>
            Oops! Something went wrong. Please refresh the page.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button
            className="rounded-full px-10 dark:text-text-dark"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </EmptyContent>
      </Empty>
    </>
  );
}

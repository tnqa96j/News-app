import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import type { RouteComponentProps } from "@/router";

export default function Page404({ navigate }: RouteComponentProps) {
  return (
    <>
      <div className="main-bg">
        <Header />
        <section className="flex min-h-[80vh] flex-col items-center justify-center gap-10 p-base">
          <div>
            <h1 className="text-8xl font-bold text-primary md:text-9xl text-center">404</h1>
            <p className="text-[24px] md:text-[32px] font-bold text-primary text-center">
              Page Not Found
            </p>
          </div>

          <p className="text-center text-12-16-20 text-muted-foreground">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable. Let's get you back on track.
          </p>

          <Button
            className="rounded-full px-10 text-text-dark gap-4"
            onClick={() => navigate("/")}
          >
            <Home className="size-6" />
            Back to Home
          </Button>
        </section>
      </div>
    </>
  );
}

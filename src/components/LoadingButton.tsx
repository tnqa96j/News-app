import { Button, buttonVariants } from "./ui/button";
import { type VariantProps } from "class-variance-authority";
import React from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { Spinner } from "./ui/spinner";

interface LoadingButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => Promise<unknown> | void;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, onClick, disabled, ...props }, ref) => {
    const { isLoading, stopLoading } = useLoading();

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!onClick) return;

      try {
        await onClick(event);
      } catch (error) {
        console.error("Button Action Error:", error);
        stopLoading();
      }
    };

    return (
      <Button
        {...props}
        ref={ref}
        disabled={disabled || isLoading} // isLoading => disable
        onClick={handleClick}
      >
        {isLoading && <Spinner data-icon="inline-start" />}
        {children}
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";

export default LoadingButton;

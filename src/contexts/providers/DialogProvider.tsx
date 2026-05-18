import { useCallback, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";

/* context */
import { DialogContext, type DialogConfig } from "@/contexts/DialogContext";
import { useLoading } from "@/contexts/LoadingContext";

/* redux */
export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false),
    [config, setConfig] = useState<DialogConfig | null>(null);

  const { startLoading, stopLoading, isLoading } = useLoading();

  const openDialog = useCallback((newConfig: DialogConfig) => {
    setConfig(newConfig);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = async () => {
    if (!config) return;
    startLoading();
    await config.onConfirm();
    closeDialog();
  };

  const handleCancel = () => {
    config?.onCancel?.();
    closeDialog();
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      <Dialog
        open={open}
        onOpenChange={config?.preventClose ? undefined : setOpen}
      >
        <DialogContent
          showCloseButton={false}
          onPointerDownOutside={(e) => isLoading && e.preventDefault()}
          onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
          onInteractOutside={(e) => isLoading && e.preventDefault()}
          onAnimationEnd={(e) => {
            if (!open && e.target === e.currentTarget) {
              setConfig(null);
              stopLoading();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[24px] lg:text-[28px]">
              {config?.title}
            </DialogTitle>
            {config?.description && (
              <DialogDescription>{config?.description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-between">
              {/* Cancel Button */}
              <Button
                variant="outline"
                className="w-[47.5%] rounded-full"
                disabled={isLoading}
                onClick={handleCancel}
              >
                {config?.cancelText ?? "Cancel"}
              </Button>

              {/* Confirm Button */}
              <LoadingButton
                variant={config?.confirmVariant ?? "default"}
                className="w-[47.5%] rounded-full"
                onClick={(e) => {
                  handleConfirm();
                  e.currentTarget.blur();
                }}
              >
                {config?.confirmText ?? "Confirm"}
              </LoadingButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};

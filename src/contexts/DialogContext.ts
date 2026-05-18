import { createContext, useContext } from "react";

export interface DialogConfig {
  title: string; 
  description?: string;
  confirmText?: string; // 預設"Comfirm"
  cancelText?: string; // 預設"Cancel"
  confirmVariant?: "default" | "destructive" | "outline";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  preventClose?: boolean; // 防止點外部關閉
}

interface DialogContextType {
  openDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
}

export const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog must be used within DialogProvider");
  return context;
};

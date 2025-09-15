import { type ToastProps } from "@/components/ui/toast"; // <-- IMPORT THE PROPS
import * as React from "react";

type ToasterToast = ToastProps & {
  // <-- Now includes 'variant'
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement; // Use React.ReactElement
};

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterProps = {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, "id">) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
};

const ToasterContext = React.createContext<ToasterProps | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToasterContext);

  if (!context) {
    throw new Error("useToast must be used within a Toaster");
  }

  return context;
}

"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProps,
  ToastTitle,
  ToastViewport,
} from "./toast";

type ToasterToast = ToastProps & {
  // Use the imported ToastProps
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  duration?: number; // ms (اختیاری)
};

type ToasterContextType = {
  toasts: ToasterToast[];
  toast: (t: Omit<ToasterToast, "id">) => {
    id: string;
    dismiss: () => void;
    update: (p: ToasterToast) => void;
  };
  dismiss: (id?: string) => void;
};

const ToasterContext = React.createContext<ToasterContextType | undefined>(
  undefined
);

export function useToast() {
  const ctx = React.useContext(ToasterContext);
  if (!ctx) throw new Error("useToast must be used within a ToasterProvider");
  return ctx;
}

/** ToasterProvider: This should be placed in your RootLayout */
export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = uuidv4();
    const toastItem: ToasterToast = { id, ...props };
    setToasts((s) => [...s, toastItem]);

    if (props.duration && props.duration > 0) {
      setTimeout(
        () => setToasts((s) => s.filter((t) => t.id !== id)),
        props.duration
      );
    }

    return {
      id,
      dismiss: () => setToasts((s) => s.filter((t) => t.id !== id)),
      update: (p: ToasterToast) =>
        setToasts((s) => s.map((t) => (t.id === id ? { ...t, ...p } : t))),
    };
  }, []);

  const dismiss = React.useCallback((id?: string) => {
    if (!id) setToasts([]);
    else setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  return (
    <ToasterContext.Provider value={{ toasts, toast, dismiss }}>
      <ToastPrimitives.Provider swipeDirection="right">
        {children}
        {toasts.map(({ id, title, description, action, variant, ...props }) => (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastPrimitives.Provider>
    </ToasterContext.Provider>
  );
}

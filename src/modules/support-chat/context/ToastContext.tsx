"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import ToastContainer, { Toast } from "../components/Toast";

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
  showSuccess: (
    title: string,
    message?: string,
    options?: Partial<Toast>
  ) => void;
  showError: (
    title: string,
    message?: string,
    options?: Partial<Toast>
  ) => void;
  showWarning: (
    title: string,
    message?: string,
    options?: Partial<Toast>
  ) => void;
  showInfo: (title: string, message?: string, options?: Partial<Toast>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = generateId();
      const newToast: Toast = {
        id,
        duration: 5000, // Default 5 seconds
        ...toast,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Remove oldest toasts if we exceed maxToasts
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });
    },
    [maxToasts]
  );

  const showSuccess = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      showToast({
        type: "success",
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      showToast({
        type: "error",
        title,
        message,
        duration: 7000, // Longer duration for errors
        ...options,
      });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      showToast({
        type: "warning",
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      showToast({
        type: "info",
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

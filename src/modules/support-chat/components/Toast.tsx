"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, { useEffect, useState } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles =
      "relative overflow-hidden rounded-lg shadow-lg border-l-4 p-4 mb-3 transform transition-all duration-300 ease-in-out";

    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    if (isVisible) {
      return `${baseStyles} translate-x-0 opacity-100`;
    }

    return `${baseStyles} translate-x-full opacity-0`;
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-500 text-gray-800 dark:text-gray-200";
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "fa-check-circle";
      case "error":
        return "fa-exclamation-circle";
      case "warning":
        return "fa-exclamation-triangle";
      case "info":
        return "fa-info-circle";
      default:
        return "fa-info-circle";
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className={`flex items-start ${getTypeStyles()}`}>
        <div className="flex-shrink-0">
          <DIcon
            icon={getIcon()}
            classCustom={`text-lg ${
              toast.type === "success"
                ? "text-green-500"
                : toast.type === "error"
                ? "text-red-500"
                : toast.type === "warning"
                ? "text-yellow-500"
                : "text-blue-500"
            }`}
          />
        </div>

        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">{toast.title}</h4>
          {toast.message && (
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          )}
          {toast.action && (
            <div className="mt-2">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium underline hover:no-underline"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <DIcon icon="fa-times" classCustom="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = "top-right",
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case "top-right":
        return "fixed top-4 right-4 z-50";
      case "top-left":
        return "fixed top-4 left-4 z-50";
      case "bottom-right":
        return "fixed bottom-4 right-4 z-50";
      case "bottom-left":
        return "fixed bottom-4 left-4 z-50";
      case "top-center":
        return "fixed top-4 left-1/2 transform -translate-x-1/2 z-50";
      case "bottom-center":
        return "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50";
      default:
        return "fixed top-4 right-4 z-50";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className={`${getPositionStyles()} w-80 max-w-sm`}>
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;
export { ToastComponent };
export type { Toast as SupportToast };

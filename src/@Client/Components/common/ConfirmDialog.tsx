import React from "react";
import { Button } from "ndui-ahrom";
import DIcon from "./DIcon";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmIcon?: React.ReactNode;
  cancelIcon?: React.ReactNode;
  confirmVariant?: "primary" | "secondary" | "accent" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "تایید",
  cancelLabel = "انصراف",
  onConfirm,
  onCancel,
  isLoading = false,
  confirmIcon = <DIcon icon="fa-check" cdi={false} classCustom="ml-2" />,
  cancelIcon = <DIcon icon="fa-times" cdi={false} classCustom="ml-2" />,
  confirmVariant = "primary",
  size = "md",
  className = "",
}) => {
  if (!isOpen) return null;

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "max-w-sm";
      case "lg":
        return "max-w-2xl";
      default:
        return "max-w-md";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onCancel}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className={`inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${getSizeClass()} w-full ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-right sm:w-full">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-headline"
                >
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              variant={confirmVariant}
              icon={confirmIcon}
              className="w-full sm:w-auto sm:text-sm mr-2"
            >
              {isLoading ? "در حال پردازش..." : confirmLabel}
            </Button>
            <Button
              onClick={onCancel}
              disabled={isLoading}
              variant="ghost"
              icon={cancelIcon}
              className="w-full sm:w-auto sm:text-sm mt-3 sm:mt-0"
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
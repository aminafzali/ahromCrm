"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./ToastContext";

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

interface ToastContainerProps {
  position?: ToastPosition;
}

const getPositionClasses = (position: ToastPosition) => {
  const baseClasses = "fixed z-50 flex flex-col gap-2";
  const positions: Record<ToastPosition, string> = {
    "top-left": "top-4 left-4 items-start",
    "top-right": "top-4 right-4 items-end",
    "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-left": "bottom-4 left-4 items-start",
    "bottom-right": "bottom-4 right-4 items-end",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  };

  return `${baseClasses} ${positions[position]}`;
};

const ToastContainer: React.FC<ToastContainerProps> = ({ position = "bottom-right" }) => {
  const { toasts } = useToast();

  return (
    <div className={getPositionClasses(position)}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`alert alert-${toast.type}  alert-soft shadow-lg`}
          >
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

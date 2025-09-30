import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

// ... interface ModalProps (بدون تغییر)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  parentId?: string;
  onExited?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  parentId,
  onExited,
}) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ... sizeClass (بدون تغییر)
  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[size];

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleExitComplete = () => {
    setTimeout(() => {
      previousActiveElement.current?.focus();
    }, 0);
    if (onExited) onExited();
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          className="modal modal-open"
          style={{ zIndex: parentId ? 100 : 50 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          {/* ❌ FocusTrap از اینجا حذف شد ❌ */}
          <motion.div
            className={`modal-box ${sizeClass} bg-white !p-2`}
            style={{ scrollbarWidth: "none", maxHeight: "75%" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <button
              className="btn btn-sm btn-circle btn-ghost text-lg"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
            {title && (
              <h3 className="font-bold text-lg mb-4" id="modal-title">
                {title}
              </h3>
            )}
            <div className="modal-content">{children}</div>
            {footer && <div className="modal-action mt-6">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

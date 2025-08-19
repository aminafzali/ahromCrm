import React, { useEffect, useRef } from "react";
import FocusTrap from "focus-trap-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  parentId?: string; // For nested modals
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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    '2xl': "max-w-2xl",
  }[size];

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Add event listener for escape key
      document.addEventListener("keydown", handleEscape);

      // Prevent body scrolling
      document.body.style.overflow = "hidden";

      // Add ARIA attributes to body
      document.body.setAttribute("aria-hidden", "true");
    } else {
      // Restore focus when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }

      // Remove event listener
      document.removeEventListener("keydown", handleEscape);

      // Restore body scrolling
      document.body.style.overflow = "";

      // Remove ARIA attributes from body
      document.body.removeAttribute("aria-hidden");

      // Call onExited callback
      onExited?.();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      document.body.removeAttribute("aria-hidden");
    };
  }, [isOpen, onClose, onExited]);

  const modalContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`modal-box ${sizeClass} bg-white !p-2`}
      style={{
        scrollbarWidth: "none",
        maxHeight: '75%'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      ref={modalRef}
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
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusTrap>
          <div
            className="modal modal-open "
            style={{ zIndex: parentId ? 100 : 50 }}
          >
            {modalContent}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="modal-backdrop"
              onClick={onClose}
              aria-hidden="true"
            />
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
};

export default Modal;

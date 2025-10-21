"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Types
interface TicketMessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
  value?: string;
  onChangeValue?: (value: string) => void;
  actionMode?: "reply" | "edit" | null;
  actionPreview?: string;
  onCancelAction?: () => void;
  className?: string;
  maxLength?: number;
  showFileUpload?: boolean;
  onFileUpload?: (file: File) => void;
  isInternal?: boolean;
}

// Constants
const DEFAULT_MAX_LENGTH = 4000;
const TYPING_DEBOUNCE_MS = 300;
const AUTO_RESIZE_DEBOUNCE_MS = 100;
const MIN_TEXTAREA_HEIGHT = 40;
const MAX_TEXTAREA_HEIGHT = 120;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Helper Functions
const isEnterKey = (e: React.KeyboardEvent): boolean => {
  return e.key === "Enter" && !e.shiftKey;
};

const isShiftEnter = (e: React.KeyboardEvent): boolean => {
  return e.key === "Enter" && e.shiftKey;
};

// Sub-components
const ActionPreview: React.FC<{
  mode: "reply" | "edit";
  preview: string;
  onCancel: () => void;
}> = ({ mode, preview, onCancel }) => (
  <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
    <div>
      {mode === "reply" ? "پاسخ به:" : "ویرایش پیام:"} {preview}
    </div>
    <button
      type="button"
      onClick={onCancel}
      className="text-red-600 hover:underline"
    >
      لغو
    </button>
  </div>
);

const FileUploadButton: React.FC<{
  onFileUpload: (file: File) => void;
  disabled: boolean;
}> = ({ onFileUpload, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = useCallback(
    (file: File): { isValid: boolean; error?: string } => {
      if (file.size > MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `فایل باید کمتر از ${Math.round(
            MAX_FILE_SIZE / (1024 * 1024)
          )} مگابایت باشد`,
        };
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return { isValid: false, error: "نوع فایل پشتیبانی نمی‌شود" };
      }

      return { isValid: true };
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const validation = validateFile(file);
        if (validation.isValid) {
          onFileUpload(file);
        } else {
          alert(validation.error);
        }
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onFileUpload, validateFile]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="آپلود فایل"
      >
        <DIcon icon="fa-paperclip" classCustom="text-lg" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};

// Main Component
const TicketMessageInput: React.FC<TicketMessageInputProps> = ({
  onSend,
  placeholder = "پیام خود را بنویسید...",
  disabled = false,
  onTyping,
  value = "",
  onChangeValue,
  actionMode = null,
  actionPreview = "",
  onCancelAction,
  className = "",
  maxLength = DEFAULT_MAX_LENGTH,
  showFileUpload = false,
  onFileUpload,
  isInternal = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);
  const [isInternalMessage, setIsInternalMessage] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(MIN_TEXTAREA_HEIGHT);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef(true);

  // Sync with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced auto-resize textarea
  const debouncedResize = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isMountedRef.current && textareaRef.current) {
          const textarea = textareaRef.current;
          textarea.style.height = "auto";
          const newHeight = Math.min(
            Math.max(textarea.scrollHeight, MIN_TEXTAREA_HEIGHT),
            MAX_TEXTAREA_HEIGHT
          );
          textarea.style.height = `${newHeight}px`;
          setTextareaHeight(newHeight);
        }
      }, AUTO_RESIZE_DEBOUNCE_MS);
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    debouncedResize();
  }, [inputValue, debouncedResize]);

  // Debounced typing indicator
  const debouncedTyping = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (isTyping: boolean) => {
      clearTimeout(timeoutId);
      if (isTyping) {
        setIsTyping(true);
        onTyping?.(true);
        timeoutId = setTimeout(() => {
          if (isMountedRef.current) {
            setIsTyping(false);
            onTyping?.(false);
          }
        }, TYPING_DEBOUNCE_MS);
      } else {
        setIsTyping(false);
        onTyping?.(false);
      }
    };
  }, [onTyping]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      if (newValue.length > maxLength) {
        return;
      }

      setInputValue(newValue);
      onChangeValue?.(newValue);

      // Typing indicator with debouncing
      if (onTyping) {
        debouncedTyping(true);
      }
    },
    [maxLength, onChangeValue, debouncedTyping]
  );

  const handleSend = useCallback(() => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue || disabled) {
      return;
    }

    onSend(trimmedValue);
    setInputValue("");
    onChangeValue?.("");

    // Stop typing indicator
    if (onTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Reset internal message state
    setIsInternalMessage(false);
  }, [inputValue, disabled, onSend, onChangeValue, onTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleCancelAction = useCallback(() => {
    onCancelAction?.();
  }, [onCancelAction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const canSend = inputValue.trim().length > 0 && !disabled;
  const remainingChars = maxLength - inputValue.length;
  const isNearLimit = remainingChars < 100;

  return (
    <div className={`p-4 bg-gray-50 ${className}`}>
      {/* Action Preview */}
      {actionMode && actionPreview && (
        <ActionPreview
          mode={actionMode}
          preview={actionPreview}
          onCancel={handleCancelAction}
        />
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3" dir="rtl">
        {/* Send button - باید سمت راست باشد برای فارسی */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          title="ارسال پیام"
        >
          <DIcon icon="fa-paper-plane" classCustom="text-lg" />
        </button>

        {/* Internal Message Toggle */}
        {isInternal && (
          <button
            onClick={() => setIsInternalMessage(!isInternalMessage)}
            className={`p-3 rounded-lg transition-colors flex items-center justify-center ${
              isInternalMessage
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title={isInternalMessage ? "پیام داخلی" : "پیام عمومی"}
          >
            <DIcon icon="fa-lock" classCustom="text-lg" />
          </button>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            maxLength={maxLength}
          />

          {/* Character Count */}
          {isNearLimit && (
            <div
              className={`absolute bottom-2 left-2 text-xs ${
                remainingChars < 0 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {remainingChars}
            </div>
          )}
        </div>

        {/* File Upload */}
        {showFileUpload && onFileUpload && (
          <FileUploadButton onFileUpload={onFileUpload} disabled={disabled} />
        )}
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedTicketMessageInput = React.memo(
  TicketMessageInput,
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.actionMode === nextProps.actionMode &&
      prevProps.actionPreview === nextProps.actionPreview &&
      prevProps.maxLength === nextProps.maxLength &&
      prevProps.showFileUpload === nextProps.showFileUpload &&
      prevProps.isInternal === nextProps.isInternal
    );
  }
);

MemoizedTicketMessageInput.displayName = "TicketMessageInput";

export default MemoizedTicketMessageInput;
export type { TicketMessageInputProps };

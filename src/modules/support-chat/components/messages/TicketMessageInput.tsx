"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, { useCallback, useEffect, useRef, useState } from "react";

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
}

// Constants
const DEFAULT_MAX_LENGTH = 4000;
const TYPING_DEBOUNCE_MS = 1000;

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
  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3 border-r-4 border-blue-500">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {mode === "reply" ? "پاسخ به:" : "ویرایش پیام:"}
      </div>
      <button
        onClick={onCancel}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <DIcon icon="fa-times" classCustom="text-sm" />
      </button>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
      {preview}
    </div>
  </div>
);

const FileUploadButton: React.FC<{
  onFileUpload: (file: File) => void;
  disabled: boolean;
}> = ({ onFileUpload, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onFileUpload]
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
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sync with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      if (newValue.length > maxLength) {
        return;
      }

      setInputValue(newValue);
      onChangeValue?.(newValue);

      // Typing indicator
      if (onTyping) {
        setIsTyping(true);
        onTyping(true);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          onTyping(false);
        }, TYPING_DEBOUNCE_MS);
      }
    },
    [maxLength, onChangeValue, onTyping]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (isEnterKey(e)) {
        e.preventDefault();
        handleSend();
      } else if (isShiftEnter(e)) {
        // Allow new line
        return;
      }
    },
    []
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
  }, [inputValue, disabled, onSend, onChangeValue, onTyping]);

  const handleCancelAction = useCallback(() => {
    onCancelAction?.();
  }, [onCancelAction]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const canSend = inputValue.trim().length > 0 && !disabled;
  const remainingChars = maxLength - inputValue.length;
  const isNearLimit = remainingChars < 100;

  return (
    <div
      className={`bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 ${className}`}
    >
      {/* Action Preview */}
      {actionMode && actionPreview && (
        <ActionPreview
          mode={actionMode}
          preview={actionPreview}
          onCancel={handleCancelAction}
        />
      )}

      {/* Input Area */}
      <div className="p-3 sm:p-4">
        <div className="flex items-end gap-3">
          {/* File Upload */}
          {showFileUpload && onFileUpload && (
            <FileUploadButton onFileUpload={onFileUpload} disabled={disabled} />
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

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            title="ارسال پیام"
          >
            <DIcon icon="fa-paper-plane" classCustom="text-lg" />
          </button>
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            در حال تایپ...
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketMessageInput;
export type { TicketMessageInputProps };

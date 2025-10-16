"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { KeyboardEvent, useRef, useState } from "react";

interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
  value?: string;
  onChangeValue?: (v: string) => void;
  actionMode?: "reply" | "edit" | null;
  actionPreview?: string;
  onCancelAction?: () => void;
}

export default function MessageInput({
  onSend,
  placeholder = "پیام خود را بنویسید...",
  disabled = false,
  onTyping,
  value,
  onChangeValue,
  actionMode = null,
  actionPreview,
  onCancelAction,
}: MessageInputProps) {
  const [internalMessage, setInternalMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const currentValue = value !== undefined ? value : internalMessage;

  const handleSend = () => {
    if (!currentValue.trim() || disabled) return;
    onSend(currentValue.trim());
    if (onChangeValue) {
      onChangeValue("");
    } else {
      setInternalMessage("");
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    onTyping?.(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (val: string) => {
    if (onChangeValue) onChangeValue(val);
    else setInternalMessage(val);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    // Typing indicator
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  return (
    <div className="p-4 bg-gray-50">
      {actionMode && (
        <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
          <div>
            {actionMode === "reply" ? "پاسخ به:" : "ویرایش پیام:"}{" "}
            {actionPreview}
          </div>
          {onCancelAction && (
            <button
              type="button"
              onClick={onCancelAction}
              className="text-red-600 hover:underline"
            >
              لغو
            </button>
          )}
        </div>
      )}
      <div className="flex items-end gap-3" dir="rtl">
        {/* Send button - باید سمت راست باشد برای فارسی */}
        <button
          onClick={handleSend}
          disabled={!currentValue.trim() || disabled}
          className={`p-3 rounded-full transition-all flex-shrink-0 ${
            currentValue.trim() && !disabled
              ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          title="ارسال پیام"
        >
          <DIcon icon="fa-paper-plane" />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            dir="rtl"
            className="w-full resize-none rounded-2xl border-2 border-gray-300 px-5 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all max-h-32 overflow-y-auto text-right bg-white"
            style={{ minHeight: "48px" }}
          />
        </div>

        {/* Additional buttons - سمت چپ */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            title="ضمیمه فایل"
          >
            <DIcon icon="fa-paperclip" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            title="ایموجی"
          >
            <DIcon icon="fa-smile" />
          </button>
        </div>
      </div>

      {/* Helper text */}
      <div className="text-xs text-gray-500 mt-2 text-center">
        برای ارسال{" "}
        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm">
          Enter
        </kbd>{" "}
        و برای خط جدید{" "}
        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm">
          Shift + Enter
        </kbd>
      </div>
    </div>
  );
}

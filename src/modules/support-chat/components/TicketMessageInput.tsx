"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { KeyboardEvent, useRef, useState } from "react";

interface TicketMessageInputProps {
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

export default function TicketMessageInput({
  onSend,
  placeholder = "پیام خود را بنویسید...",
  disabled = false,
  onTyping,
  value,
  onChangeValue,
  actionMode = null,
  actionPreview,
  onCancelAction,
}: TicketMessageInputProps) {
  const [internalMessage, setInternalMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const currentValue = value !== undefined ? value : internalMessage;

  const handleSend = () => {
    if (!currentValue.trim() || disabled) return;
    onSend(currentValue.trim());
    if (onChangeValue) onChangeValue("");
    else setInternalMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    onTyping?.(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (val: string) => {
    if (onChangeValue) onChangeValue(val);
    else setInternalMessage(val);

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
    <div className="border-t dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      {/* Input Area */}
      <div className="flex items-end gap-2">
        <button
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          type="button"
        >
          <DIcon icon="fa-paperclip" />
        </button>

        <div className="flex-1 relative">
          {actionMode && (
            <div className="flex items-center justify-between mb-2 text-xs text-gray-600 w-full">
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
          <textarea
            ref={textareaRef}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`w-full resize-none rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 transition-all max-h-32 overflow-y-auto dark:bg-slate-700 dark:text-white border-gray-300 focus:border-teal-500 focus:ring-teal-200 dark:border-slate-600`}
            style={{ minHeight: "48px" }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!currentValue.trim() || disabled}
          type="button"
          className={`p-3 rounded-full transition-all ${
            currentValue.trim() && !disabled
              ? "bg-teal-500 text-white hover:bg-teal-600 shadow-md"
              : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-700"
          }`}
        >
          <DIcon icon="fa-paper-plane" />
        </button>
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
        برای ارسال{" "}
        <kbd className="px-1 bg-gray-100 dark:bg-slate-700 rounded">Enter</kbd>{" "}
        و برای خط جدید{" "}
        <kbd className="px-1 bg-gray-100 dark:bg-slate-700 rounded">
          Shift + Enter
        </kbd>{" "}
        را فشار دهید
      </div>
    </div>
  );
}

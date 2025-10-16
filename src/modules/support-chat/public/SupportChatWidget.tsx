"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useRef, useState } from "react";
import { useSupportPublicChat } from "./hooks/useSupportPublicChat";

interface SupportChatWidgetProps {
  workspaceSlug?: string;
}

export default function SupportChatWidget({
  workspaceSlug,
}: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; body: string } | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    connect,
    disconnect,
    connected,
    messages,
    ticketId,
    guestId,
    startOrResume,
    send,
    isTyping,
    otherTyping,
    handleTyping,
    canSendMessage,
    validateMessage,
    editMessage,
    deleteMessage,
    uploadFile,
    hasMoreMessages,
    loadingMore,
    loadMoreMessages,
  } = useSupportPublicChat({ workspaceSlug });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      connect();
      startOrResume();
    } else {
      disconnect();
    }
  }, [isOpen, connect, disconnect, startOrResume]);

  // Play notification sound for new messages
  const playNotificationSound = () => {
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Silent fail
    } catch (error) {
      // Silent fail if audio not available
    }
  };

  // Play sound for new messages from others
  useEffect(() => {
    if (messages.length > 0 && !isOpen) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.isInternal) {
        playNotificationSound();
      }
    }
  }, [messages.length, isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await send(message, replyTo?.id, replyTo?.body);
      setMessage("");
      setReplyTo(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert(error instanceof Error ? error.message : "خطا در ارسال پیام");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTyping(e.target.value.length > 0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile(file);
      // Send file as message
      await send(`📎 فایل: ${result.fileName} - ${result.fileUrl}`);
    } catch (error) {
      console.error("File upload failed:", error);
      alert(error instanceof Error ? error.message : "خطا در آپلود فایل");
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "همین الان";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} دقیقه پیش`;
    return date.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case "sending":
        return (
          <DIcon icon="fa-clock" cdi={false} classCustom="text-xs opacity-50" />
        );
      case "sent":
        return (
          <DIcon icon="fa-check" cdi={false} classCustom="text-xs opacity-50" />
        );
      case "delivered":
        return (
          <DIcon
            icon="fa-check-double"
            cdi={false}
            classCustom="text-xs opacity-50"
          />
        );
      case "failed":
        return (
          <DIcon
            icon="fa-exclamation-triangle"
            cdi={false}
            classCustom="text-xs text-red-500"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg relative"
          icon={<DIcon icon="fa-comments" cdi={false} classCustom="text-xl" />}
        >
          {messages.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-lg border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">پشتیبانی آنلاین</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
                icon={<DIcon icon="fa-times" cdi={false} />}
              />
            </div>
            <div className="text-sm opacity-90 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-400" : "bg-yellow-400"
                }`}
              />
              {connected ? "متصل" : "در حال اتصال..."}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {/* Load more button */}
            {hasMoreMessages && (
              <div className="flex justify-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="text-xs"
                  icon={
                    loadingMore ? (
                      <DIcon
                        icon="fa-spinner"
                        cdi={false}
                        classCustom="animate-spin"
                      />
                    ) : (
                      <DIcon icon="fa-chevron-up" cdi={false} />
                    )
                  }
                >
                  {loadingMore
                    ? "در حال بارگذاری..."
                    : "بارگذاری پیام‌های قبلی"}
                </Button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <DIcon
                  icon="fa-comments"
                  cdi={false}
                  classCustom="text-4xl mb-2"
                />
                <p>سلام! چطور می‌تونم کمکتون کنم؟</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.isInternal ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg relative group ${
                      msg.isInternal
                        ? "bg-gray-100 text-gray-800"
                        : "bg-primary text-white"
                    } ${msg.isDeleted ? "opacity-50" : ""}`}
                  >
                    {/* Reply preview */}
                    {msg.replyToId && msg.replySnapshot && (
                      <div
                        className={`text-xs p-2 rounded mb-2 border-r-2 ${
                          msg.isInternal
                            ? "bg-gray-200 border-gray-400"
                            : "bg-white/20 border-white/40"
                        }`}
                      >
                        <div className="font-medium">پاسخ به:</div>
                        <div className="truncate">{msg.replySnapshot}</div>
                      </div>
                    )}

                    {/* Render attachment preview if message contains a file URL pattern */}
                    {/^\s*📎\s*فایل:\s*/.test(msg.body) ? (
                      (() => {
                        const match = msg.body.match(
                          /📎\s*فایل:\s*(.*?)\s*-\s*(\S+)/
                        );
                        const originalName = match?.[1] || "فایل";
                        const url = match?.[2] || "";
                        const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
                        return (
                          <div className="space-y-2">
                            {isImage ? (
                              <a href={url} target="_blank" rel="noreferrer">
                                <img
                                  src={url}
                                  alt={originalName}
                                  className="max-w-full max-h-40 rounded"
                                />
                              </a>
                            ) : null}
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-xs underline ${
                                msg.isInternal ? "text-blue-700" : "text-white"
                              }`}
                            >
                              دانلود {originalName}
                            </a>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-sm">{msg.body}</p>
                    )}

                    {/* Edit indicator */}
                    {msg.isEdited && (
                      <div className="text-xs opacity-50 mt-1">ویرایش شده</div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-70">
                        {formatMessageTime(msg.createdAt)}
                      </p>
                      <div className="flex items-center gap-1">
                        {!msg.isInternal && getMessageStatusIcon(msg.status)}

                        {/* Message actions for own messages */}
                        {!msg.isInternal && !msg.isDeleted && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => {
                                const newBody = prompt(
                                  "ویرایش پیام:",
                                  msg.body
                                );
                                if (newBody && newBody !== msg.body) {
                                  editMessage(Number(msg.id), newBody);
                                }
                              }}
                              className="text-xs p-1 hover:bg-white/20 rounded"
                              title="ویرایش"
                            >
                              <DIcon
                                icon="fa-edit"
                                cdi={false}
                                classCustom="text-xs"
                              />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    "آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟"
                                  )
                                ) {
                                  deleteMessage(Number(msg.id));
                                }
                              }}
                              className="text-xs p-1 hover:bg-white/20 rounded text-red-300"
                              title="حذف"
                            >
                              <DIcon
                                icon="fa-trash"
                                cdi={false}
                                classCustom="text-xs"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {otherTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-1">
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
                    <span className="text-xs text-gray-500 mr-2">
                      پشتیبان در حال تایپ...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Reply preview */}
          {replyTo && (
            <div className="px-4 py-2 bg-gray-50 border-t border-b">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-600">پاسخ به: </span>
                  <span className="font-medium">{replyTo.body}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  icon={
                    <DIcon icon="fa-times" cdi={false} classCustom="text-xs" />
                  }
                />
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="پیام خود را بنویسید..."
                className="flex-1"
                disabled={!canSendMessage()}
                name={""}
              />
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={!connected || !canSendMessage()}
                icon={<DIcon icon="fa-paperclip" cdi={false} />}
                title="آپلود فایل"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || !connected || !canSendMessage()}
                icon={<DIcon icon="fa-paper-plane" cdi={false} />}
              />
            </div>

            {/* Rate limit warning */}
            {!canSendMessage() && (
              <p className="text-xs text-red-500 mt-1">
                تعداد پیام‌های ارسالی زیاد است. لطفاً کمی صبر کنید.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

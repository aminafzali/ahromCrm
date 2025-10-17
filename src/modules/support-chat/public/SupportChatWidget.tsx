"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useRef, useState } from "react";
import { useSupportPublicChat } from "./hooks/useSupportPublicChat";
import "./SupportChatWidget.css";

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
      // Start or resume after connection is established
      setTimeout(() => {
        startOrResume();
      }, 100);
    } else {
      // Don't disconnect when widget is closed, just hide it
      // This allows guest to receive messages even when widget is closed
    }
  }, [isOpen, connect, startOrResume]);

  // Auto-connect and join room when component mounts
  useEffect(() => {
    connect();
    setTimeout(() => {
      startOrResume();
    }, 100);
  }, [connect, startOrResume]);

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
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="chat-button w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          icon={
            <DIcon
              icon="fa-comments"
              cdi={false}
              classCustom="text-lg sm:text-xl text-white"
            />
          }
        >
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold animate-pulse">
              {messages.length > 9 ? "9+" : messages.length}
            </span>
          )}
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel w-80 sm:w-96 h-96 sm:h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <DIcon icon="fa-headset" cdi={false} classCustom="text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    پشتیبانی آنلاین
                  </h3>
                  <div className="text-xs opacity-90 flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        connected ? "bg-green-400" : "bg-yellow-400"
                      }`}
                    />
                    {connected ? "متصل" : "در حال اتصال..."}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                icon={
                  <DIcon icon="fa-times" cdi={false} classCustom="text-sm" />
                }
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Load more button */}
            {hasMoreMessages && (
              <div className="flex justify-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors"
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DIcon
                    icon="fa-comments"
                    cdi={false}
                    classCustom="text-2xl text-blue-500"
                  />
                </div>
                <p className="text-sm sm:text-base font-medium">
                  سلام! چطور می‌تونم کمکتون کنم؟
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  پیام خود را بنویسید تا با تیم پشتیبانی صحبت کنید
                </p>
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
                    className={`message-bubble max-w-[85%] sm:max-w-xs p-3 rounded-2xl relative group transition-all duration-200 ${
                      msg.isInternal
                        ? "bg-gray-100 text-gray-800 rounded-bl-md message-support"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md message-user"
                    } ${msg.isDeleted ? "opacity-50" : ""}`}
                  >
                    {/* Reply preview */}
                    {msg.replyToId && msg.replySnapshot && (
                      <div
                        className={`text-xs p-2 rounded-lg mb-2 border-r-2 ${
                          msg.isInternal
                            ? "bg-gray-200 border-gray-400"
                            : "bg-white/20 border-white/40"
                        }`}
                      >
                        <div className="font-medium text-xs opacity-75">
                          پاسخ به:
                        </div>
                        <div className="truncate text-xs">
                          {msg.replySnapshot}
                        </div>
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
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="block"
                              >
                                <img
                                  src={url}
                                  alt={originalName}
                                  className="max-w-full max-h-32 sm:max-h-40 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                />
                              </a>
                            ) : null}
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-xs underline hover:no-underline transition-all flex items-center gap-1 ${
                                msg.isInternal ? "text-blue-700" : "text-white"
                              }`}
                            >
                              <DIcon
                                icon="fa-download"
                                cdi={false}
                                classCustom="text-xs"
                              />
                              دانلود {originalName}
                            </a>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-sm leading-relaxed break-words">
                        {msg.body}
                      </p>
                    )}

                    {/* Edit indicator */}
                    {msg.isEdited && (
                      <div className="text-xs opacity-60 mt-1 flex items-center gap-1">
                        <DIcon
                          icon="fa-edit"
                          cdi={false}
                          classCustom="text-xs"
                        />
                        ویرایش شده
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
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
                              className="text-xs p-1.5 hover:bg-white/20 rounded-full transition-colors"
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
                              className="text-xs p-1.5 hover:bg-red-500/20 rounded-full transition-colors text-red-300 hover:text-red-200"
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
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full typing-dot" />
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full typing-dot"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full typing-dot"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
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
            <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="text-sm flex items-center gap-2">
                  <DIcon
                    icon="fa-reply"
                    cdi={false}
                    classCustom="text-xs text-blue-500"
                  />
                  <span className="text-gray-600">پاسخ به: </span>
                  <span className="font-medium text-gray-800 truncate max-w-[200px]">
                    {replyTo.body}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full p-1"
                  icon={
                    <DIcon icon="fa-times" cdi={false} classCustom="text-xs" />
                  }
                />
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="پیام خود را بنویسید..."
                className="chat-input flex-1 text-sm"
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
                className="chat-button text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full p-2 transition-colors"
                icon={
                  <DIcon
                    icon="fa-paperclip"
                    cdi={false}
                    classCustom="text-sm"
                  />
                }
                title="آپلود فایل"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || !connected || !canSendMessage()}
                className="chat-button bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                icon={
                  <DIcon
                    icon="fa-paper-plane"
                    cdi={false}
                    classCustom="text-sm"
                  />
                }
                title="ارسال پیام"
              />
            </div>

            {/* Rate limit warning */}
            {!canSendMessage() && (
              <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
                <DIcon
                  icon="fa-exclamation-triangle"
                  cdi={false}
                  classCustom="text-xs"
                />
                <span>تعداد پیام‌های ارسالی زیاد است. لطفاً کمی صبر کنید.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

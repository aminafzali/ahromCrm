// Hook برای استفاده از streaming chatbot
"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThinkingLog, WorkflowDefinition } from "../types/workflow";

interface StreamMessage {
  type: "thinking" | "content" | "progress" | "complete" | "error";
  data: any;
}

export function useChatbotStream() {
  const { activeWorkspace } = useWorkspace();
  const [thinkingLogs, setThinkingLogs] = useState<ThinkingLog[]>([]);
  const [currentContent, setCurrentContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      sessionId?: number,
      onComplete?: (data: any) => void
    ) => {
      if (!activeWorkspace?.id) {
        setError("برای استفاده از چت‌بات ابتدا یک ورک‌اسپیس را انتخاب کنید.");
        return;
      }

      // پاک کردن state قبلی
      setThinkingLogs([]);
      setCurrentContent("");
      setError(null);
      setIsStreaming(true);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-Workspace-Id": activeWorkspace.id.toString(),
        };

        const response = await fetch("/api/chatbot/stream", {
          method: "POST",
          headers,
          body: JSON.stringify({
            message,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error("خطا در برقراری ارتباط با سرور");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("خطا در خواندن پاسخ سرور");
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // پردازش رویدادهای SSE
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              const eventType = line.substring(7).trim();
              continue;
            }

            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.substring(6));

              if (data.step) {
                // Thinking log
                const log: ThinkingLog = {
                  step: data.step,
                  action: data.action,
                  thought: data.thought,
                  data: data.data,
                  timestamp: new Date(data.timestamp || Date.now()),
                };
                setThinkingLogs((prev) => [...prev, log]);
              } else if (data.text !== undefined) {
                // Content update
                setCurrentContent(data.text);
              } else if (data.type === "complete") {
                setIsStreaming(false);
                if (onComplete) {
                  onComplete(data);
                }
              } else if (data.type === "error") {
                setIsStreaming(false);
                setError(data.message);
              }
            }
          }
        }

        setIsStreaming(false);
      } catch (err) {
        setIsStreaming(false);
        const message =
          err instanceof Error
            ? err.message
            : "خطای ناشناخته‌ای رخ داد، لطفا دوباره تلاش کنید.";
        setError(message);
      }
    },
    [activeWorkspace?.id]
  );

  const executeWorkflow = useCallback(
    async (
      workflowOrId: string | WorkflowDefinition,
      sessionId?: number,
      onComplete?: (data: any) => void
    ) => {
      if (!activeWorkspace?.id) {
        setError("برای استفاده از workflow ابتدا یک ورک‌اسپیس را انتخاب کنید.");
        return;
      }

      // پاک کردن state قبلی
      setThinkingLogs([]);
      setCurrentContent("");
      setError(null);
      setIsStreaming(true);

      try {
        let workflow: WorkflowDefinition;

        // اگر workflowId داده شده، workflow را از API بگیر
        if (typeof workflowOrId === "string") {
          const workflowResponse = await fetch(
            `/api/chatbot/workflow?id=${workflowOrId}`,
            {
              headers: {
                "X-Workspace-Id": activeWorkspace.id.toString(),
              },
            }
          );

          if (!workflowResponse.ok) {
            throw new Error("خطا در دریافت workflow از سرور");
          }

          const workflowData = await workflowResponse.json();
          if (!workflowData.success || !workflowData.data) {
            throw new Error("Workflow پیدا نشد");
          }

          workflow = workflowData.data;
        } else {
          // اگر workflow definition مستقیماً داده شده
          workflow = workflowOrId;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-Workspace-Id": activeWorkspace.id.toString(),
        };

        const response = await fetch("/api/chatbot/stream", {
          method: "POST",
          headers,
          body: JSON.stringify({
            workflow,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error("خطا در برقراری ارتباط با سرور");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("خطا در خواندن پاسخ سرور");
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // پردازش رویدادهای SSE (فرمت: event: TYPE\ndata: JSON\n\n)
          const messages = buffer.split("\n\n");
          buffer = messages.pop() || ""; // آخرین پیام ناقص را نگه دار

          for (const message of messages) {
            if (!message.trim()) continue;

            const lines = message.split("\n");
            let eventType = "";
            let eventData: any = null;

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.substring(7).trim();
              } else if (line.startsWith("data: ")) {
                try {
                  eventData = JSON.parse(line.substring(6));
                } catch (parseError) {
                  console.error(
                    "[useChatbotStream] Error parsing SSE data:",
                    parseError
                  );
                  continue;
                }
              }
            }

            // پردازش بر اساس نوع event
            if (eventType === "thinking" && eventData) {
              const log: ThinkingLog = {
                step: eventData.step || "unknown",
                action: eventData.action || "",
                thought: eventData.thought || "",
                data: eventData.data,
                timestamp: new Date(eventData.timestamp || Date.now()),
              };
              setThinkingLogs((prev) => [...prev, log]);
            } else if (eventType === "content" && eventData) {
              setCurrentContent(eventData.text || "");
            } else if (eventType === "progress" && eventData) {
              const log: ThinkingLog = {
                step: `progress_${eventData.stepId || "unknown"}`,
                action: "پیشرفت مرحله",
                thought: `مرحله ${eventData.stepId} تکمیل شد`,
                data: eventData.result,
                timestamp: new Date(),
              };
              setThinkingLogs((prev) => [...prev, log]);
            } else if (eventType === "complete" && eventData) {
              setIsStreaming(false);
              if (onComplete) {
                onComplete(eventData);
              }
            } else if (eventType === "error" && eventData) {
              setIsStreaming(false);
              setError(eventData.message || "خطای ناشناخته");
            }
          }
        }

        setIsStreaming(false);
      } catch (err) {
        setIsStreaming(false);
        const message =
          err instanceof Error
            ? err.message
            : "خطای ناشناخته‌ای رخ داد، لطفا دوباره تلاش کنید.";
        setError(message);
      }
    },
    [activeWorkspace?.id]
  );

  const clearThinkingLogs = useCallback(() => {
    setThinkingLogs([]);
    setCurrentContent("");
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    sendMessage,
    executeWorkflow,
    thinkingLogs,
    currentContent,
    isStreaming,
    error,
    clearThinkingLogs,
  };
}

// Streaming endpoint برای chatbot با Server-Sent Events
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { ChatbotServiceApi } from "@/modules/chatbot/service/ChatbotServiceApi";
import { WorkflowEngine } from "@/modules/chatbot/service/WorkflowEngine";
import {
  ThinkingLog,
  WorkflowDefinition,
} from "@/modules/chatbot/types/workflow";
import { NextRequest } from "next/server";

const service = new ChatbotServiceApi();

export async function POST(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req, true, true);
    const body = await req.json();

    // ایجاد streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const send = (type: string, data: any) => {
          const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          if (body.workflow) {
            // اجرای workflow
            const workflow: WorkflowDefinition = body.workflow;
            const engine = new WorkflowEngine();

            send("thinking", {
              step: "workflow_init",
              action: "شروع workflow",
              thought: `شروع اجرای workflow: ${workflow.name}`,
            });

            const sessionId = body.sessionId || 0;

            const result = await engine.executeWorkflow(
              workflow,
              context,
              sessionId,
              (log: ThinkingLog) => {
                send("thinking", {
                  ...log,
                  timestamp: log.timestamp.toISOString(),
                });
              },
              (stepId: string, stepResult: any) => {
                send("progress", { stepId, result: stepResult });
              }
            );
            send("complete", result);
          } else {
            // پردازش پیام عادی با streaming
            const message = body.message || "";

            send("thinking", {
              step: "message_received",
              action: "دریافت پیام",
              thought: `پیام دریافت شد: ${message.substring(0, 50)}...`,
            });

            // پردازش تدریجی پیام
            const result = await service.handleMessage(
              message,
              context,
              body.sessionId
            );

            // ارسال پاسخ به صورت تدریجی (شبیه‌سازی تایپ)
            const words = result.reply.split(" ");
            for (let i = 0; i < words.length; i++) {
              const partial = words.slice(0, i + 1).join(" ");
              send("content", { text: partial, isComplete: false });
              await new Promise((resolve) => setTimeout(resolve, 50)); // تأخیر بین کلمات
            }

            send("content", { text: result.reply, isComplete: true });
            send("complete", {
              sessionId: result.sessionId,
              intent: result.intent,
              completed: result.completed,
            });
          }
        } catch (error) {
          send("error", {
            message: error instanceof Error ? error.message : String(error),
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "خطا در ایجاد stream",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

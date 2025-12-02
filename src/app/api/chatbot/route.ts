import { ApiResponse } from "@/@Server/Http/Response/ApiResponse";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { ChatbotServiceApi } from "@/modules/chatbot/service/ChatbotServiceApi";
import { NextRequest } from "next/server";

const service = new ChatbotServiceApi();

export async function POST(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req, true, true);
    const body = await req.json();

    if (!body?.message || typeof body.message !== "string") {
      return ApiResponse.badRequest("متن پیام الزامی است.");
    }

    const result = await service.handleMessage(
      body.message,
      context,
      body.sessionId
    );

    return ApiResponse.success(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "مشکلی در پردازش پیام رخ داد.";
    return ApiResponse.internalServerError(message, error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req, true, true);
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const list = searchParams.get("list");

    // اگر list=true باشد، لیست همه session ها را برمی‌گردانیم
    if (list === "true") {
      const limit = Number(searchParams.get("limit") || "50");
      console.log("[API] getAllSessions called with:", {
        workspaceId: context.workspaceId,
        workspaceUserId: context.workspaceUser?.id,
        limit,
      });
      const sessions = await service.getAllSessions(context, limit);
      console.log("[API] getAllSessions returning:", {
        sessionCount: sessions.length,
        sessionIds: sessions.map((s: any) => s.id),
      });
      return ApiResponse.success(sessions);
    }

    // در غیر این صورت، تاریخچه یک session خاص را برمی‌گردانیم
    if (!sessionId) {
      return ApiResponse.badRequest("شناسه جلسه الزامی است.");
    }

    const session = await service.getSessionHistory(Number(sessionId), context);
    return ApiResponse.success(session);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "امکان دریافت تاریخچه نیست.";
    return ApiResponse.internalServerError(message, error);
  }
}

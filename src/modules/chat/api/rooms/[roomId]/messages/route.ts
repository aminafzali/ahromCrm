import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest } from "next/server";
import { ChatServiceApi } from "../../../../service/ChatServiceApi";

const service = new ChatServiceApi();

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);

    if (!context.workspaceId || !context.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    const roomId = Number(params.roomId);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    console.log("🚀 Chat Messages API: Loading messages for room", roomId);
    const res = await service.listMessages(roomId, { page, limit });
    console.log("📡 Chat Messages API: Response", res);

    return new Response(JSON.stringify(res), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Chat Messages API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);

    if (!context.workspaceId || !context.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    const roomId = Number(params.roomId);
    const body = await req.json();

    console.log(
      "🚀 Chat Messages API: Creating message for room",
      roomId,
      body
    );
    const created = await service.createMessage(roomId, body, context);
    console.log("📡 Chat Messages API: Created message", created);

    return new Response(JSON.stringify(created), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Chat Messages API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

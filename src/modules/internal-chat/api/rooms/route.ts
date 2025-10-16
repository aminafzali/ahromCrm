import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { InternalChatServiceApi } from "../../service/InternalChatServiceApi";

const service = new InternalChatServiceApi();

/**
 * Create or get direct/team room
 */
export async function POST(req: NextRequest) {
  try {
    // Get auth context
    const context = await AuthProvider.isAuthenticated(req);

    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const body = await req.json();

    if (type === "direct") {
      const room = await service.getOrCreateDirectRoom(body, context);
      return NextResponse.json(room);
    } else if (type === "team") {
      const room = await service.getOrCreateTeamRoom(body, context);
      return NextResponse.json(room);
    }

    return NextResponse.json({ error: "Invalid room type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

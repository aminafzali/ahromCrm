import { NextRequest, NextResponse } from "next/server";
import { SupportChatServiceApi } from "../../../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

/**
 * Create ticket from guest user (public endpoint)
 * No authentication required
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, ...ticketData } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    // Get client IP and other info
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const ticket = await service.createGuestTicket(
      {
        ...ticketData,
        ipAddress,
        userAgent,
      },
      parseInt(workspaceId)
    );

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}


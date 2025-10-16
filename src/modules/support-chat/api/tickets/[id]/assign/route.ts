import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { SupportChatServiceApi } from "../../../../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

/**
 * Assign ticket to support agent (Admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const ticketId = parseInt(params.id);
    const { assignToId } = await req.json();

    const ticket = await service.assignTicket(ticketId, assignToId, context);
    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}


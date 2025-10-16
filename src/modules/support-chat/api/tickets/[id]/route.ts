import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { SupportChatServiceApi } from "../../../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

/**
 * Get ticket by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const ticketId = parseInt(params.id);

    const ticket = await service.getTicketById(ticketId, context);
    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}


import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { SupportChatServiceApi } from "../../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

/**
 * Get all tickets (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);

    const url = new URL(req.url);
    const params = {
      page: parseInt(url.searchParams.get("page") || "1"),
      limit: parseInt(url.searchParams.get("limit") || "20"),
      status: (url.searchParams.get("status") as any) || undefined,
      priority: (url.searchParams.get("priority") as any) || undefined,
      assignedToId: url.searchParams.get("assignedToId")
        ? parseInt(url.searchParams.get("assignedToId")!)
        : undefined,
      categoryId: url.searchParams.get("categoryId")
        ? parseInt(url.searchParams.get("categoryId")!)
        : undefined,
    };

    const tickets = await service.getAllTickets(params, context);

    // Get unread counts for each ticket
    const unreadCounts: { [key: number]: number } = {};
    for (const ticket of tickets.data || []) {
      try {
        const unreadCount = await service.getUnreadMessageCount(
          ticket.id,
          context
        );
        unreadCounts[ticket.id] = unreadCount;
      } catch (error) {
        console.error(
          `Error getting unread count for ticket ${ticket.id}:`,
          error
        );
        unreadCounts[ticket.id] = 0;
      }
    }

    return NextResponse.json({
      ...tickets,
      unreadCounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

/**
 * Create ticket from customer
 */
export async function POST(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const body = await req.json();

    const ticket = await service.createCustomerTicket(body, context);
    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

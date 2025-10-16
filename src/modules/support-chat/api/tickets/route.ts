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
      status: url.searchParams.get("status") || undefined,
      priority: url.searchParams.get("priority") || undefined,
      assignedToId: url.searchParams.get("assignedToId") 
        ? parseInt(url.searchParams.get("assignedToId")!) 
        : undefined,
      categoryId: url.searchParams.get("categoryId")
        ? parseInt(url.searchParams.get("categoryId")!)
        : undefined,
    };

    const tickets = await service.getAllTickets(params, context);
    return NextResponse.json(tickets);
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


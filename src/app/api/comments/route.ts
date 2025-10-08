import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { CommentServiceApi } from "@/modules/comments/service/CommentServiceApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Extract filters from searchParams
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    const filters: any = {};
    if (entityType) filters.entityType = entityType;
    if (entityId) filters.entityId = parseInt(entityId);

    const commentService = new CommentServiceApi();
    const result = await commentService.getAll(
      { page, limit, filters },
      context
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Comments API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const commentService = new CommentServiceApi();
    const result = await commentService.create(body, context);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Comments API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

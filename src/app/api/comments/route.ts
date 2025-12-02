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
    const filters: any = {};

    // New format: relation IDs
    const taskId = searchParams.get("taskId");
    const knowledgeId = searchParams.get("knowledgeId");
    const documentId = searchParams.get("documentId");
    const projectId = searchParams.get("projectId");

    if (taskId) filters.taskId = parseInt(taskId);
    if (knowledgeId) filters.knowledgeId = parseInt(knowledgeId);
    if (documentId) filters.documentId = parseInt(documentId);
    if (projectId) filters.projectId = parseInt(projectId);

    // Backward compatibility: old format
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    if (entityType && entityId) {
      filters.entityType = entityType;
      filters.entityId = parseInt(entityId);
    }

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

import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  const { prisma } = await import("@/lib/prisma");
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const ticketId = formData.get("ticketId") as string;

    if (!file || !ticketId) {
      return NextResponse.json(
        { error: "File and ticketId are required" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "support-chat");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Create file URL
    const fileUrl = `/uploads/support-chat/${fileName}`;

    // Resolve workspaceId from ticket to scope documents correctly
    const ticket = await prisma.supportChatTicket.findUnique({
      where: { id: parseInt(ticketId) },
      select: { workspaceId: true },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Invalid ticketId" }, { status: 400 });
    }

    const workspaceId = ticket.workspaceId;

    // Ensure DocumentCategory 'supportChatFiles' exists for this workspace
    const categoryName = "supportChatFiles";
    let category = await prisma.documentCategory.findFirst({
      where: { workspaceId, name: categoryName, parentId: null },
      select: { id: true },
    });
    if (!category) {
      category = await prisma.documentCategory.create({
        data: {
          workspaceId,
          name: categoryName,
          description: "Files uploaded from Support Chat",
        },
        select: { id: true },
      });
    }

    // Create Document record
    const document = await prisma.document.create({
      data: {
        workspaceId,
        categoryId: category.id,
        originalName: file.name,
        filename: fileName,
        mimeType: file.type,
        size: file.size as number,
        url: fileUrl,
        type: "support_chat",
        entityType: "supportChatTicket",
        entityId: parseInt(ticketId),
      },
      select: { id: true },
    });

    // Save file info to database (legacy fields + link to Document)
    const attachment = await prisma.supportChatAttachment.create({
      data: {
        ticketId: parseInt(ticketId),
        fileName: file.name,
        filePath: fileUrl,
        fileSize: file.size as number,
        mimeType: file.type,
        documentId: document.id,
      } as any,
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      attachmentId: attachment.id,
      documentId: document.id,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

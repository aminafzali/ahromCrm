// مسیر فایل: src/app/api/workspaces/[id]/route.ts

import {
  BaseException,
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from "@/@Server/Exceptions/BaseException";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { WorkspaceApiService } from "@/@Server/services/workspaces/WorkspaceApiService";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const service = new WorkspaceApiService();

// اسکیمای اعتبارسنجی برای ویرایش ورک‌اسپیس
const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "نام ورک‌اسپیس باید حداقل ۳ کاراکتر باشد.")
    .optional(),
  slug: z
    .string()
    .min(3, "اسلاگ باید حداقل ۳ کاراکتر باشد.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ نامعتبر است.")
    .optional(),
});

/**
 * دریافت اطلاعات یک ورک‌اسپیس خاص
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const numericId = parseInt(params.id, 10);

    // اینجا چون فقط در حال خواندن هستیم، نیازی به سرویس خاصی نیست و می‌توان مستقیم از پریزما خواند
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: numericId,
        // اطمینان از اینکه کاربر عضو ورک‌اسپیس است
        members: {
          some: {
            userId: context.user!.id,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        "Workspace not found or you do not have access."
      );
    }

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error("--- DEBUG: Error in GET /api/workspaces/[id] ---", error);
    if (error instanceof BaseException) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

/**
 * ویرایش اطلاعات یک ورک‌اسپیس
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const numericId = parseInt(params.id, 10);

    // ابتدا ورک‌اسپیس را پیدا می‌کنیم
    const workspace = await prisma.workspace.findUnique({
      where: { id: numericId },
    });

    if (!workspace) {
      throw new NotFoundException("Workspace not found.");
    }

    // **بررسی امنیتی کلیدی: فقط مالک می‌تواند ورک‌اسپیس را ویرایش کند**
    if (workspace.ownerId !== context.user!.id) {
      throw new ForbiddenException("Only the workspace owner can edit it.");
    }

    const body = await req.json();
    const validatedData = updateWorkspaceSchema.parse(body);

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: numericId },
      data: validatedData,
    });

    return NextResponse.json(updatedWorkspace);
  } catch (error: any) {
    console.error("--- DEBUG: Error in PATCH /api/workspaces/[id] ---", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: new ValidationException(error.format()).errors },
        { status: 422 }
      );
    }
    if (error instanceof BaseException) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

/**
 * حذف یک ورک‌اسپیس
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const numericId = parseInt(params.id, 10);

    const workspace = await prisma.workspace.findUnique({
      where: { id: numericId },
    });

    if (!workspace) {
      throw new NotFoundException("Workspace not found.");
    }

    // **بررسی امنیتی کلیدی: فقط مالک می‌تواند ورک‌اسپیس را حذف کند**
    if (workspace.ownerId !== context.user!.id) {
      throw new ForbiddenException("Only the workspace owner can delete it.");
    }

    await prisma.workspace.delete({
      where: { id: numericId },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error: any) {
    console.error("--- DEBUG: Error in DELETE /api/workspaces/[id] ---", error);
    if (error instanceof BaseException) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

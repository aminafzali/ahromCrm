// مسیر فایل: src/app/api/[slug]/upload/route.ts
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { UploadHelper } from "@/lib/uploadHelper";
import fs from "fs";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const formData = await req.formData();

    // شاخهٔ مخصوص اسناد: ذخیره بر اساس ورک‌اسپیس و ساخت رکورد Document
    if (slug === "documents") {
      try {
        // Workspace may be provided via header or session; don't hard-require at auth step
        const context = await AuthProvider.isAuthenticated(req, true, false);
        const headerWs =
          req.headers.get("x-workspace-id") ||
          req.headers.get("X-Workspace-Id");
        const workspaceId = headerWs
          ? Number(headerWs)
          : Number(context.workspaceId);
        if (!workspaceId)
          return NextResponse.json(
            {
              error:
                "Workspace not identified (provide X-Workspace-Id header or active workspace)",
            },
            { status: 400 }
          );

        const files = formData.getAll("files") as File[];
        const type = (formData.get("type") as string) || undefined;
        const categoryId = formData.get("categoryId")
          ? Number(formData.get("categoryId"))
          : undefined;
        const entityType = (formData.get("entityType") as string) || undefined;
        const entityId = formData.get("entityId")
          ? Number(formData.get("entityId"))
          : undefined;

        if (!files || files.length === 0) {
          return NextResponse.json(
            { error: "No files provided" },
            { status: 400 }
          );
        }

        const uploaded = await Promise.all(
          files.map((f) =>
            UploadHelper.uploadFileForWorkspace(
              f,
              workspaceId,
              type ?? "general"
            )
          )
        );

        const created = await Promise.all(
          uploaded.map((u) =>
            (prisma as any).document.create({
              data: {
                workspaceId,
                originalName: u.originalName,
                filename: u.filename,
                mimeType: u.mimeType,
                size: u.size,
                url: u.url,
                type: type,
                ...(categoryId ? { categoryId } : {}),
                ...(entityType ? { entityType } : {}),
                ...(entityId ? { entityId } : {}),
              },
            })
          )
        );

        return NextResponse.json({ files: created });
      } catch (err: any) {
        console.error("[UPLOAD:documents] error", err);
        return NextResponse.json(
          { error: err?.message || "Upload failed" },
          { status: 500 }
        );
      }
    }

    // رفتار پیش‌فرض (ماژول‌های دیگر): ذخیره ساده در ریشهٔ uploads
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);
    return NextResponse.json({ url: `/api/uploads/${file.name}` });
  } catch (error: any) {
    console.error("[UPLOAD] route error", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

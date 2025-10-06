import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  const filePath = path.join(process.cwd(), "uploads", ...params.path);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  const file = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
      ? "image/webp"
      : ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".pdf"
      ? "application/pdf"
      : "application/octet-stream";
  return new NextResponse(file, { headers: { "Content-Type": contentType } });
}

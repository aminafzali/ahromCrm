import fs from "fs";
import { NextResponse } from 'next/server';
import path from 'path';



export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const filePath = path.join(process.cwd(), "uploads", (await params).filename);

  // بررسی اینکه آیا فایل وجود دارد یا نه
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const file = fs.readFileSync(filePath);
  return new NextResponse(file, { headers: { "Content-Type": "image/jpeg" } });
}
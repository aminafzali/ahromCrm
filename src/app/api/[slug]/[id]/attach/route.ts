import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/id/attach/route`);

    // Check if the GET handler exists
    if (loadedModule.GET) {
      return loadedModule.GET(req , id);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}
export async function POST(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const formData = await req.formData();
    const file = formData.get("file") as File;
  
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
  
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
  
    // مسیر ذخیره‌سازی فایل
    const uploadDir = path.join(process.cwd(), "uploads");
  
    // اگر پوشه‌ی uploads وجود نداشت، ایجاد کن
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
  
    // ذخیره‌ی فایل در پوشه‌ی uploads
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);
  
    // بازگرداندن URL فایل
    return NextResponse.json({ url: `/api/uploads/${file.name}` });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}




export async function PATCH(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/id/attach/route`);

    if (loadedModule.POST) {
      return loadedModule.PATCH(req);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}



export async function PUT(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/id/attach/route`);

    if (loadedModule.POST) {
      return loadedModule.PUT(req);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}



export async function DELETE(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/id/attach/route`);

    if (loadedModule.POST) {
      return loadedModule.DELETE(req);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}

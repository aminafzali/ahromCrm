import { BaseException } from "@/@Server/Exceptions/BaseException";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { UploadHelper } from "@/lib/uploadHelper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // بررسی احراز هویت (بدون نیاز به workspace context)
    await AuthProvider.isAuthenticated(req, true, false);

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const urls = await UploadHelper.uploadFiles(files);
    return NextResponse.json({ urls });
  } catch (error) {
    if (error instanceof BaseException) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Error uploading files" },
      { status: 500 }
    );
  }
}

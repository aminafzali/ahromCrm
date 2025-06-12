import { NextRequest, NextResponse } from "next/server";
import { UploadHelper } from "@/lib/uploadHelper";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return isAdmin(req, async () => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const brandId = parseInt(params.id);

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      // Upload file and get URL
      const [url] = await UploadHelper.uploadFiles([file]);

      // Update brand with new logo URL
      const brand = await prisma.brand.update({
        where: { id: brandId },
        data: { logoUrl: url }
      });

      return NextResponse.json({ brand });
    } catch (error) {
      console.error('Error uploading brand logo:', error);
      return NextResponse.json(
        { error: 'Error uploading logo' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return isAdmin(req, async () => {
    try {
      const brand = await prisma.brand.findUnique({
        where: { id: parseInt(params.id) }
      });

      if (!brand?.logoUrl) {
        return NextResponse.json(
          { error: 'No logo found' },
          { status: 404 }
        );
      }

      // Delete file from storage
      await UploadHelper.deleteFile(brand.logoUrl);

      // Remove logo URL from brand
      await prisma.brand.update({
        where: { id: parseInt(params.id) },
        data: { logoUrl: null }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting brand logo:', error);
      return NextResponse.json(
        { error: 'Error deleting logo' },
        { status: 500 }
      );
    }
  });
}
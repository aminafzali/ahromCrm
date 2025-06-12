import { NextRequest, NextResponse } from "next/server";
import { UploadHelper } from "@/lib/uploadHelper";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return isAdmin(req, async () => {
    try {
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];
      const productId = parseInt(params.id);

      if (!files || files.length === 0) {
        return NextResponse.json(
          { error: 'No files provided' },
          { status: 400 }
        );
      }

      // Upload files and get URLs
      const urls = await UploadHelper.uploadFiles(files);

      // Create image records in database
      const images = await Promise.all(
        urls.map(async (url, index) => {
          return prisma.productImage.create({
            data: {
              productId,
              url,
              alt: files[index].name,
              sortOrder: index,
              isPrimary: index === 0
            }
          });
        })
      );

      return NextResponse.json({ images });
    } catch (error) {
      console.error('Error uploading product images:', error);
      return NextResponse.json(
        { error: 'Error uploading images' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return isAdmin(req, async () => {
    try {
      const { imageId } = await req.json();
      
      const image = await prisma.productImage.findUnique({
        where: { id: parseInt(imageId) }
      });

      if (!image) {
        return NextResponse.json(
          { error: 'Image not found' },
          { status: 404 }
        );
      }

      // Delete file from storage
      await UploadHelper.deleteFile(image.url);

      // Delete record from database
      await prisma.productImage.delete({
        where: { id: parseInt(imageId) }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting product image:', error);
      return NextResponse.json(
        { error: 'Error deleting image' },
        { status: 500 }
      );
    }
  });
}
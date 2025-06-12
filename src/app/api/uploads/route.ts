import { isAdmin } from '@/lib/auth';
import { UploadHelper } from '@/lib/uploadHelper';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return isAdmin(req, async () => {
    try {
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];

      if (!files || files.length === 0) {
        return NextResponse.json(
          { error: 'No files provided' },
          { status: 400 }
        );
      }

      const urls = await UploadHelper.uploadFiles(files);

      return NextResponse.json({ urls });
    } catch (error) {
      console.error('Error uploading files:', error);
      return NextResponse.json(
        { error: 'Error uploading files' },
        { status: 500 }
      );
    }
  });
}


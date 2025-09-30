import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class UploadHelper {
  private static UPLOAD_DIR = path.join(process.cwd(), '/uploads');
  private static ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static MAX_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Upload a single file
   */
  static async uploadFile(file: File): Promise<string> {
    try {
      // Validate file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        throw new Error('File type not allowed');
      }

      // Validate file size
      if (file.size > this.MAX_SIZE) {
        throw new Error('File size too large');
      }

      // Generate unique filename
      const ext = path.extname(file.name);
      const filename = `${uuidv4()}${ext}`;
      const filepath = path.join(this.UPLOAD_DIR, filename);

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Save file
      await writeFile(filepath, buffer);

      // Return relative path
      return `/api/uploads/${filename}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(files: File[]): Promise<string[]> {
    const uploads = files.map(file => this.uploadFile(file));
    return Promise.all(uploads);
  }

  /**
   * Delete a file
   */
  static async deleteFile(filepath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), 'public', filepath);
      await writeFile(fullPath, '');
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}
import fs from "fs";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export class UploadHelper {
  private static UPLOAD_DIR = path.join(process.cwd(), "uploads");
  private static ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  private static MAX_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Upload a single file
   */
  static async uploadFile(file: File): Promise<string> {
    try {
      // Ensure upload directory exists
      if (!fs.existsSync(this.UPLOAD_DIR)) {
        fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
      }
      // Validate file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        throw new Error("File type not allowed");
      }

      // Validate file size
      if (file.size > this.MAX_SIZE) {
        throw new Error("File size too large");
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
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(files: File[]): Promise<string[]> {
    const uploads = files.map((file) => this.uploadFile(file));
    return Promise.all(uploads);
  }

  /**
   * Delete a file
   */
  static async deleteFile(filepath: string): Promise<void> {
    try {
      // When we store url like /api/uploads/<filename>, map it back to local uploads dir
      const filename = path.basename(filepath);
      const fullPath = path.join(this.UPLOAD_DIR, filename);
      await unlink(fullPath);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  /**
   * Workspace-scoped upload with optional subdirectory and date partitioning
   */
  static async uploadFileForWorkspace(
    file: File,
    workspaceId: number,
    subdir?: string
  ): Promise<{
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    originalName: string;
  }> {
    // Ensure upload directory exists
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }

    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error("File type not allowed");
    }

    // Validate file size
    if (file.size > this.MAX_SIZE) {
      throw new Error("File size too large");
    }

    const ext = path.extname(file.name).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const base = path.join(
      this.UPLOAD_DIR,
      String(workspaceId),
      subdir ?? "general",
      year,
      month
    );
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

    const filepath = path.join(base, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/api/uploads/${workspaceId}/${
      subdir ?? "general"
    }/${year}/${month}/${filename}`;
    return {
      url,
      filename,
      mimeType: file.type,
      size: file.size,
      originalName: file.name,
    };
  }

  static async deleteWorkspaceFile(urlOrPath: string): Promise<void> {
    try {
      const relative = urlOrPath.replace(/^\/api\/uploads\//, "");
      const fullPath = path.join(this.UPLOAD_DIR, relative);
      await unlink(fullPath);
    } catch (error) {
      console.error("Error deleting workspace file:", error);
      throw error;
    }
  }
}

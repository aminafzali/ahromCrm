import { Document, DocumentCategory } from "@prisma/client";

export type DocumentWithRelations = Document & {
  category?: Pick<DocumentCategory, "id" | "name"> | null;
};

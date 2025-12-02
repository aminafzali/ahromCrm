import { Document, DocumentCategory, Task } from "@prisma/client";

export type DocumentWithRelations = Document & {
  category?: Pick<DocumentCategory, "id" | "name"> | null;
  task?: Pick<Task, "id" | "title"> | null;
};

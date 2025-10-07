import { KnowledgeCategory } from "@prisma/client";

export type KnowledgeCategoryWithRelations = KnowledgeCategory & {
  parent?: KnowledgeCategory | null;
  children?: KnowledgeCategory[];
};



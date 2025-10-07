import { z } from "zod";

const relatedEntity = z
  .object({ id: z.coerce.number().int().positive() })
  .passthrough();

export const createKnowledgeSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  category: relatedEntity.optional().nullable(),
  labels: z.array(relatedEntity).optional(),
  assignees: z.array(relatedEntity).optional(),
});

export const updateKnowledgeSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  category: relatedEntity.optional().nullable(),
  labels: z.array(relatedEntity).optional(),
  assignees: z.array(relatedEntity).optional(),
});

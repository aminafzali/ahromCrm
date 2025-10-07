"use client";

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { useCrud } from "@/@Client/hooks/useCrud";
import { useMemo } from "react";
import { z } from "zod";

const related = z
  .object({ id: z.coerce.number().int().positive() })
  .passthrough();

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  parent: related.optional().nullable(),
});

const updateSchema = createSchema.partial();

export type KnowledgeCategoryWithRelations = any;

class Repo extends BaseRepository<KnowledgeCategoryWithRelations, number> {
  constructor() {
    super("knowledge-categories");
  }
}

export function useKnowledgeCategory() {
  const repo = useMemo(() => new Repo(), []);
  return useCrud<
    KnowledgeCategoryWithRelations,
    z.infer<typeof createSchema>,
    z.infer<typeof updateSchema>
  >(repo);
}

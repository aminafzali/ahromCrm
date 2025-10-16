"use client";

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { useCrud } from "@/@Client/hooks/useCrud";
import { useMemo } from "react";
import { z } from "zod";
import { createKnowledgeSchema, updateKnowledgeSchema } from "../validation/schema";

export type KnowledgeWithRelations = any;

class KnowledgeRepository extends BaseRepository<KnowledgeWithRelations, number> {
  constructor() {
    super("knowledge");
  }
}

export function useKnowledge() {
  const repo = useMemo(() => new KnowledgeRepository(), []);
  return useCrud<
    KnowledgeWithRelations,
    z.infer<typeof createKnowledgeSchema>,
    z.infer<typeof updateKnowledgeSchema>
  >(repo);
}



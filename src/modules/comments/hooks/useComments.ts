"use client";

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { useCrud } from "@/@Client/hooks/useCrud";
import { useMemo } from "react";
import { z } from "zod";

const createSchema = z
  .object({
    taskId: z.coerce.number().int().positive().optional().nullable(),
    knowledgeId: z.coerce.number().int().positive().optional().nullable(),
    documentId: z.coerce.number().int().positive().optional().nullable(),
    projectId: z.coerce.number().int().positive().optional().nullable(),
    body: z.string().min(1),
    parent: z.object({ id: z.coerce.number() }).optional().nullable(),
    // Backward compatibility
    entityType: z.string().optional(),
    entityId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // At least one relation must be provided
      return (
        data.taskId ||
        data.knowledgeId ||
        data.documentId ||
        data.projectId ||
        data.entityId
      );
    },
    {
      message:
        "At least one relation (taskId, knowledgeId, documentId, or projectId) must be provided",
    }
  );

const updateSchema = z.object({
  body: z.string().min(1).optional(),
});

export type CommentWithRelations = any;

class Repo extends BaseRepository<CommentWithRelations, number> {
  constructor() {
    super("comments");
  }
  like(id: number) {
    return this.post(`${this.slug}/${id}/like`, {});
  }
  unlike(id: number) {
    return this.Delete(`${this.slug}/${id}/like`);
  }
}

export function useComments() {
  const repo = useMemo(() => new Repo(), []);
  const hook = useCrud<
    CommentWithRelations,
    z.infer<typeof createSchema>,
    z.infer<typeof updateSchema>
  >(repo);
  return {
    ...hook,
    like: (id: number) => repo.like(id),
    unlike: (id: number) => repo.unlike(id),
  };
}

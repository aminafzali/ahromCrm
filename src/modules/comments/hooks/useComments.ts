"use client";

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { useCrud } from "@/@Client/hooks/useCrud";
import { useMemo } from "react";
import { z } from "zod";

const createSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.coerce.number().int().positive(),
  body: z.string().min(1),
  parent: z.object({ id: z.coerce.number() }).optional().nullable(),
});

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

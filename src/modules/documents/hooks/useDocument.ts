"use client";

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { useCrud } from "@/@Client/hooks/useCrud";
import { useMemo } from "react";
import { z } from "zod";
import { DocumentWithRelations } from "../types";
import {
  createDocumentSchema,
  updateDocumentSchema,
} from "../validation/schema";

class DocumentRepository extends BaseRepository<any, number> {
  constructor() {
    super("documents");
  }
  upsertTeamPermission(
    id: number,
    data: {
      teamId: number;
      canRead?: boolean;
      canWrite?: boolean;
      canDelete?: boolean;
    }
  ) {
    return this.post(`${this.slug}/${id}/permissions`, data);
  }
  deleteTeamPermission(id: number, data: { teamId: number }) {
    const url = `${this.slug}/${id}/permissions?teamId=${encodeURIComponent(
      String(data.teamId)
    )}`;
    return this.Delete(url);
  }
}

export function useDocument() {
  const repo = useMemo(() => new DocumentRepository(), []);
  const hook = useCrud<
    DocumentWithRelations,
    z.infer<typeof createDocumentSchema>,
    z.infer<typeof updateDocumentSchema>
  >(repo);
  return { ...hook };
}

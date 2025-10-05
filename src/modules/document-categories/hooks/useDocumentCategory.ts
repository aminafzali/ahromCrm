"use client";

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { useCrud } from "@/@Client/hooks/useCrud";

class DocumentCategoryRepository extends BaseRepository<any, number> {
  constructor() {
    super("document-categories");
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

export function useDocumentCategory() {
  const repo = new DocumentCategoryRepository();
  return useCrud<any>(repo);
}

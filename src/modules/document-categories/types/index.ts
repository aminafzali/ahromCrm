export interface DocumentCategoryEntity {
  id: number;
  name: string;
  description?: string | null;
  parentId?: number | null;
}

export interface DocumentCategoryWithRelations extends DocumentCategoryEntity {
  parent?: { id: number; name: string } | null;
  children?: { id: number; name: string }[];
}

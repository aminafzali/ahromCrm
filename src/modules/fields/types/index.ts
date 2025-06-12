import { Field } from "@prisma/client";

export type FieldWithRelations = Field 

export type LabelColor = 'primary' | 'accent' | 'secondary' | 'warning' | 'success' | 'neutral' | 'info';

export interface PaginatedLabelResponse {
  data: FieldWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface FiledListProps {
  isAdmin?: boolean;
  limit?: number;
}
import { Label, User, UserGroup, Request } from "@prisma/client";

export type UserWithRelations = User & {
  labels?: Label[];
  groups?: UserGroup[];
  requests?: Request[];
};

export interface PaginatedUserResponse {
  data: UserWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface UserListProps {
  isAdmin?: boolean;
  limit?: number;
}
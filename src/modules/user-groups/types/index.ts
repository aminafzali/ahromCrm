import { Label, User, UserGroup } from "@prisma/client";

export type UserGroupWithRelations = UserGroup & {
  users?: User[];
  labels?: Label[];
};

export interface PaginatedUserGroupResponse {
  data: UserGroupWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface UserGroupListProps {
  isAdmin?: boolean;
  limit?: number;
}
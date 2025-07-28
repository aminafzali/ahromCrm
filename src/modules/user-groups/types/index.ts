import { Label, UserGroup, WorkspaceUser } from "@prisma/client";

export type UserGroupWithRelations = UserGroup & {
  workspaceUsers?: WorkspaceUser[];
  labels?: Label[];
};

// export interface PaginatedUserGroupResponse {
//   data: UserGroupWithRelations[];
//   pagination: {
//     total: number;
//     pages: number;
//     page: number;
//     limit: number;
//   };
// }

export interface UserGroupListProps {
  isAdmin?: boolean;
  limit?: number;
}

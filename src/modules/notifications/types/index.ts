import { Notification, Request, User } from "@prisma/client";

export type NotificationWithRelations = Notification & {
  user: Pick<User, "id" | "name" | "phone">;
  request?: Pick<Request, "id" | "serviceTypeId" | "statusId">;
};

export interface PaginatedNotificationResponse {
  data: NotificationWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}
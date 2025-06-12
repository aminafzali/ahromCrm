import { Invoice, Note, Notification, Request, ServiceType, Status, User } from "@prisma/client";

export type RequestWithRelations = Request & {
  user: Pick<User, "id" | "name" | "phone" | "address">;
  serviceType: ServiceType;
  status: Status;
  notes: Pick<Note, "id" | "content" | "createdAt">[];
  invoice?: Pick<Invoice, "id" | "total" | "status">;
  notifications: Pick<Notification, "id" | "title" | "message" | "isRead" | "createdAt">[];
};

export interface PaginatedRequestResponse {
  data: RequestWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface RequestListProps {
  isAdmin?: boolean;
  statusFilter?: string;
  limit?: number;
}
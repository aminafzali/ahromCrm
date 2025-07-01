import { ActualService } from "@/modules/actual-services/types"; // +++ این خط را اضافه کنید +++
import {
  Invoice,
  Note,
  Notification,
  Request,
  ServiceType,
  Status,
  User,
} from "@prisma/client";

// +++ اینترفیس جدید برای جدول واسط +++
export interface ActualServiceOnRequest {
  id: number;
  quantity: number;
  price: number;
  requestId: number;
  actualServiceId: number;
  actualService?: ActualService; // داده‌های خود خدمت واقعی
}

export type RequestWithRelations = Request & {
  user: Pick<User, "id" | "name" | "phone" | "address">;
  serviceType: ServiceType;
  status: Status;
  notes: Pick<Note, "id" | "content" | "createdAt">[];
  invoice?: Pick<Invoice, "id" | "total" | "status">;
  notifications: Pick<
    Notification,
    "id" | "title" | "message" | "isRead" | "createdAt"
  >[];

  // +++ این فیلد جدید اضافه شده است +++
  // این فیلد، آرایه‌ای از خدمات مرتبط با درخواست را نگهداری می‌کند
  actualServices: ActualServiceOnRequest[];
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

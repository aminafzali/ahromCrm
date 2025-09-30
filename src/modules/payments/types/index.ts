import { WorkspaceUser,Invoice, Payment } from "@prisma/client";

export type PaymentWithRelations = Payment & {
  workspaceUser: Pick<WorkspaceUser, "id" | "displayName" | "phone">;
  invoice?: Invoice;
};

export interface PaginatedPaymentResponse {
  data: PaymentWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}
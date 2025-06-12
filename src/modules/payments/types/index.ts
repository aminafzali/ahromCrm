import { Invoice, Payment, User } from "@prisma/client";

export type PaymentWithRelations = Payment & {
  user: Pick<User, "id" | "name" | "phone">;
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
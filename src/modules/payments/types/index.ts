import { Invoice, Payment, WorkspaceUser } from "@prisma/client";

export type PaymentWithRelations = Payment & {
  workspaceUser: Pick<WorkspaceUser, "id" | "displayName" | "phone">;
  invoice?: Invoice;
  customerBankAccount?: {
    id: number;
    title: string;
    bankName: string | null;
    iban: string | null;
    accountNumber: string | null;
    cardNumber: string | null;
  } | null;
  adminBankAccount?: {
    id: number;
    title: string;
    bankName: string | null;
    iban: string | null;
    accountNumber: string | null;
    cardNumber: string | null;
  } | null;
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
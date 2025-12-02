import { Cheque, Invoice, Payment, WorkspaceUser } from "@prisma/client";

export type ChequeWithRelations = Cheque & {
  workspaceUser: Pick<WorkspaceUser, "id" | "displayName" | "phone">;
  invoice?: Invoice | null;
  payment?: Payment | null;
  bankAccount?: {
    id: number;
    title: string;
    bankName: string | null;
    iban: string | null;
    accountNumber: string | null;
    cardNumber: string | null;
  } | null;
};

export interface PaginatedChequeResponse {
  data: ChequeWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}


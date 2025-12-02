import { User, WorkspaceUser } from "@prisma/client";

// چون Prisma هنوز regenerate نشده، مدل پایه را به صورت محلی تعریف می‌کنیم
export interface BankAccountBase {
  id: number;
  workspaceId: number;
  workspaceUserId: number | null;
  title: string;
  bankName: string | null;
  iban: string | null;
  accountNumber: string | null;
  cardNumber: string | null;
  isDefaultForReceive: boolean;
  isDefaultForPay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BankAccountWithRelations = BankAccountBase & {
  workspaceUser?: WorkspaceUser & {
    user: User;
  };
};

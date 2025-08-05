import {
  Invoice,
  InvoiceItem,
  Request,
  ServiceType,
  User,
  WorkspaceUser,
} from "@prisma/client";

/**
 * Invoice with related data
 */
export type InvoiceWithRelations = Invoice & {
  request: RequestWithRelation;
  items: InvoiceItem[];
};

/**
 * Request with user data
 */
export type RequestWithRelation = Request & {
  workspaceUser: WorkspaceUserProfile;
  serviceType: ServiceType;
};

type WorkspaceUserProfile = WorkspaceUser & {
  user: User;
};

/**
 * Invoice status type
 */
export type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED";

/**
 * Invoice item type
 */
export interface InvoiceItemType {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

/**
 * Invoice summary for dashboard
 */
export interface InvoiceSummary {
  totalCount: number;
  pendingCount: number;
  paidCount: number;
  totalRevenue: number;
  recentInvoices: InvoiceWithRelations[];
}

/**
 * Payment data type
 */
export interface PaymentData {
  amount: number;
  method: string;
  reference?: string;
  date: Date;
}

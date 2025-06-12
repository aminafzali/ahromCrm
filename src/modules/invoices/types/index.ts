import { Invoice, InvoiceItem, Request, ServiceType, User } from "@prisma/client";

/**
 * Invoice with related data
 */
export type InvoiceWithRelations = Invoice & {
  request: RequestWithUser;
  items: InvoiceItem[];
};

/**
 * Request with user data
 */
export type RequestWithUser = Request & {
  user: User;
  serviceType: ServiceType;
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
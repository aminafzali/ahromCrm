import {
  Invoice,
  InvoiceItem,
  InvoicePaymentStatus,
  InvoiceStatus,
  Label,
  Payment,
  Request,
  Role,
  ServiceType,
  User,
  UserGroup,
  WorkspaceUser,
} from "@prisma/client";

/**
 * Invoice with related data
 */
export type InvoiceWithRelations = Invoice & {
  request: RequestWithRelation;
  items: InvoiceItem[];
  payments?: Payment[];
  workspaceUser?: WorkspaceUserProfile;
  invoiceStatus: InvoiceStatus;
  paymentStatus: InvoicePaymentStatus;
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

/**
 * Request with user data
 */
export type RequestWithRelation = Request & {
  serviceType: ServiceType;
};

type WorkspaceUserProfile = WorkspaceUser & {
  user: User;
  role: Role;
  // روابط جدید را با تایپ‌های صحیح و تو در تو تعریف می‌کنیم
  labels?: Label[];
  userGroup?: UserGroup | null; // تغییر به one-to-one
  notifications?: Notification[];
};

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

// import {
//   Invoice,
//   InvoiceItem,
//   Label,
//   Request,
//   Role,
//   ServiceType,
//   User,
//   UserGroup,
//   WorkspaceUser,
// } from "@prisma/client";

// /**
//  * Invoice with related data
//  */
// export type InvoiceWithRelations = Invoice & {
//   request: RequestWithRelation;
//   items: InvoiceItem[];
//   workspaceUser?: WorkspaceUserProfile;
//   status: InvoiceStatus;
// };

// /**
//  * Request with user data
//  */
// export type RequestWithRelation = Request & {
//   serviceType: ServiceType;
// };

// type WorkspaceUserProfile = WorkspaceUser & {
//   user: User;
//   role: Role;
//   // روابط جدید را با تایپ‌های صحیح و تو در تو تعریف می‌کنیم
//   labels?: Label[];
//   userGroups?: UserGroup[];
//   notifications?: Notification[];
// };

// /**
//  * Invoice status type
//  */
// export type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED";

// /**
//  * Invoice item type
//  */
// export interface InvoiceItemType {
//   description: string;
//   quantity: number;
//   price: number;
//   total: number;
// }

// /**
//  * Invoice summary for dashboard
//  */
// export interface InvoiceSummary {
//   totalCount: number;
//   pendingCount: number;
//   paidCount: number;
//   totalRevenue: number;
//   recentInvoices: InvoiceWithRelations[];
// }

// /**
//  * Payment data type
//  */
// export interface PaymentData {
//   amount: number;
//   method: string;
//   reference?: string;
//   date: Date;
// }

import {
    Invoice,
    Product,
    PurchaseOrder,
    PurchaseOrderItem,
    StockMovement,
    User,
    WorkspaceUser,
} from "@prisma/client";

/**
 * PurchaseOrder with related data
 */
export type PurchaseOrderWithRelations = PurchaseOrder & {
  items: (PurchaseOrderItem & {
    product: Product;
  })[];
  supplierWorkspaceUser?: WorkspaceUser & {
    user: User;
  };
  linkedInvoice?: Invoice | null;
  stockMovements?: StockMovement[];
};

/**
 * PurchaseOrder item type
 */
export interface PurchaseOrderItemType {
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * PurchaseOrder summary for dashboard
 */
export interface PurchaseOrderSummary {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  receivedCount: number;
  totalValue: number;
  recentOrders: PurchaseOrderWithRelations[];
}

/**
 * PurchaseOrder status type
 */
export type PurchaseOrderStatus =
  | "PENDING"
  | "APPROVED"
  | "RECEIVED"
  | "CANCELED";


import {
  Product,
  ProductStock,
  StockMovement,
  Warehouse,
} from "@prisma/client";

/**
 * ProductStock with related data
 */
export type ProductStockWithRelations = ProductStock & {
  product: Product;
  warehouse: Warehouse;
};

/**
 * StockMovement with related data
 */
export type StockMovementWithRelations = StockMovement & {
  product: Product;
  warehouse: Warehouse;
};

/**
 * Low stock alert
 */
export interface LowStockAlert {
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  currentStock: number;
  minimumStock: number;
  status: "critical" | "warning" | "ok";
}

/**
 * Stock history entry
 */
export interface StockHistory {
  id: number;
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  movementType: string;
  createdAt: Date;
  description?: string | null;
  invoiceId?: number | null;
  orderId?: number | null;
  purchaseOrderId?: number | null;
}

/**
 * Inventory summary
 */
export interface InventorySummary {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  recentMovements: StockMovementWithRelations[];
  lowStockAlerts: LowStockAlert[];
}

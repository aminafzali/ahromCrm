import {
    Invoice,
    Order,
    OrderItem,
    Product,
    ShippingMethod,
    WorkspaceUser,
} from "@prisma/client";

export type OrderWithRelations = Order & {
  workspaceUser?: WorkspaceUser & {
    user?: {
      id: number;
      name: string | null;
      phone: string;
    };
  };
  items?: Array<
    OrderItem & {
      product?: Pick<Product, "id" | "name" | "price">;
    }
  >;
  shippingMethod?: Pick<ShippingMethod, "id" | "name" | "type" | "basePrice"> | null;
  invoice?: Pick<Invoice, "id" | "invoiceNumber" | "invoiceNumberName" | "total" | "invoiceStatus"> | null;
};

export interface PaginatedOrderResponse {
  data: OrderWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}


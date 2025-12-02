import { Warehouse } from "@prisma/client";

export type WarehouseWithRelations = Warehouse;

export interface WarehouseCreateInput {
  name: string;
  address?: string;
  description?: string;
  isActive?: boolean;
}

export interface WarehouseUpdateInput {
  name?: string;
  address?: string;
  description?: string;
  isActive?: boolean;
}


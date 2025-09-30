import { ServiceType as PrismaServiceType } from "@prisma/client";

export type ServiceType = PrismaServiceType;

export interface PaginatedServiceTypeResponse {
  data: ServiceType[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}
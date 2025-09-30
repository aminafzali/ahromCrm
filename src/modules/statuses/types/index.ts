import { Status as PrismaStatus } from "@prisma/client";

export type Status = PrismaStatus;

export interface PaginatedStatusResponse {
  data: Status[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}
/**
 * Common types for backend services
 */

import { Prisma } from '@prisma/client';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

/**
 * Query parameters for filtering and sorting
 */
export interface QueryParams {
  filters?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: Record<string, boolean | object>;
  search?: string;
  searchFields?: string[];
  dateRange?: {
    startDate?: string | Date;
    endDate?: string | Date;
  };
}

export interface SingleParam {
  include?: Record<string, boolean | object>;
}

/**
 * Combined query parameters with pagination
 */
export type FullQueryParams = PaginationParams & QueryParams;
export type SingleParams = QueryParams;

/**
 * Repository operation result
 */
export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Service operation result
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Status change event
 */
export interface StatusChangeEvent {
  entityId: number | string;
  oldStatus: string;
  newStatus: string;
  metadata?: Record<string, any>;
  entity?: any;
}

/**
 * Generic model with ID
 */
export interface Model {
  id: string | number;
}

/**
 * Prisma transaction client type
 */
export type TransactionClient = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Bulk operation types
 */
export type BulkOperationType = 'createMany' | 'updateMany' | 'deleteMany';

/**
 * Bulk operation request
 */
export interface BulkOperationRequest {
  operation: BulkOperationType;
  data: any[];
  where?: Record<string, any>;
}

/**
 * Filter operation types
 */
export type FilterOperator = 
  | 'equals' 
  | 'not' 
  | 'in' 
  | 'notIn' 
  | 'lt' 
  | 'lte' 
  | 'gt' 
  | 'gte' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith';

/**
 * Filter definition
 */
export interface FilterDefinition {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Sort definition
 */
export interface SortDefinition {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Advanced query options
 */
export interface AdvancedQueryOptions {
  filters?: FilterDefinition[];
  sort?: SortDefinition[];
  search?: {
    term: string;
    fields: string[];
  };
  pagination?: PaginationParams;
  include?: Record<string, boolean | object>;
  dateRange?: {
    field: string;
    startDate?: Date;
    endDate?: Date;
  };
}
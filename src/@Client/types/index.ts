/**
 * Common types for frontend services
 */

import { ReactNode } from "react";

export interface ActionButton {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "accent" | "ghost" | "link";
  disabled?: boolean;
  outline?: boolean;
}

export interface CreateActionButton {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "accent" | "ghost" | "link";
  disabled?: boolean;
  outline?: boolean;
  modalTitle?: string;
  modalContent: React.ReactNode | ((closeModal: () => void) => React.ReactNode);
  approveText?: string;
  cancelText?: string;
  onApprove?: () => void | Promise<void>;
}

/**
 * API response structure
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination result from API
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
 * Query parameters for API requests
 */
export interface QueryParams {
  filters?: Record<string, any>;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  search?: string;
  [key: string]: any;
}

/**
 * Combined query parameters with pagination
 */
export type FullQueryParams = PaginationParams & QueryParams;

/**
 * Form field error
 */
export interface FieldError {
  message: string;
  type: string;
}

/**
 * Form validation errors
 */
export interface FormErrors {
  [key: string]: string[] | undefined;
}

/**
 * Form submission state
 */
export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface FilterOption {
  name: string;
  label: string;
  options: { value: string | number; label: string }[];
  defaultValue?: string;
  type?: string;
}

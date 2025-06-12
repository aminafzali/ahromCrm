export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "ApiError";
  }

  /**
   * Check if the error is a not found error
   */
  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if the error is a validation error
   */
  isValidationError(): boolean {
    return this.statusCode === 422;
  }

  /**
   * Check if the error is an unauthorized error
   */
  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Check if the error is a forbidden error
   */
  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Get validation errors for a specific field
   */
  getFieldErrors(field: string): string[] | undefined {
    return this.errors?.[field];
  }

  /**
   * Get all validation errors
   */
  getAllErrors(): Record<string, string[]> | undefined {
    return this.errors;
  }

  /**
   * Get the first error message for a field
   */
  getFirstFieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}

import { z } from "zod";
import { ApiError } from "../../Exceptions/ApiError";
import { FormErrors } from "../../types";

export class FormHelper {
  /**
   * Validate form data against a schema
   */
  static validate<T>(
    schema: z.ZodType<T>,
    data: any
  ): { success: true; data: T } | { success: false; errors: FormErrors } {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: FormErrors = {};

        error.errors.forEach((err) => {
          const path = err.path.join(".");
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path]?.push(err.message);
        });

        return { success: false, errors: formattedErrors };
      }

      throw error;
    }
  }

  /**
   * Format API errors for form display
   */
  static formatApiErrors(error: unknown): FormErrors {
    if (error instanceof ApiError && error.errors) {
      return error.errors;
    }

    return {
      _form: [
        error instanceof Error ? error.message : "An unexpected error occurred",
      ],
    };
  }

  /**
   * Get default values for a form from an object
   */
  static getDefaultValues<T>(data: Partial<T>): Partial<T> {
    return { ...data };
  }

  /**
   * Transform form data before submission
   */
  // static transformFormData<T>(data: any, transformers: Partial<Record<keyof T, (value: any) => any>>): any {
  //   const result = { ...data };

  //   for (const [key, transformer] of Object.entries(transformers)) {
  //     if (data[key] !== undefined && transformer) {
  //       result[key] = transformer(data[key]);
  //     }
  //   }

  //   return result;
  // }

  /**
   * Format date for form input
   */
  static formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return "";

    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "";

    return d.toISOString().split("T")[0];
  }

  /**
   * Parse string to number or return default
   */
  static parseNumber(
    value: string | number | undefined | null,
    defaultValue: number = 0
  ): number {
    if (value === undefined || value === null || value === "")
      return defaultValue;
    if (typeof value === "number") return value;

    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Parse string to number or return default
   */
  static parsenumber(
    value: string | number | undefined | null,
    defaultValue: number = 0
  ): number {
    if (value === undefined || value === null || value === "")
      return defaultValue;
    if (typeof value === "number") return value;

    try {
      return parseInt(value);
    } catch (e) {

      return defaultValue;
    }
  }
}

// مسیر فایل: src/@Server/Http/Requests/BaseRequest.ts (یا مسیر مشابه)

import { NextRequest } from "next/server";
import { z } from "zod";
import { ValidationException } from "../../Exceptions/BaseException";

export abstract class BaseRequest<T> {
  protected schema: z.ZodType<T>;
  protected request: NextRequest;
  protected data: T | null = null;

  constructor(request: NextRequest, schema: z.ZodType<T>) {
    this.request = request;
    this.schema = schema;
    // ===== شروع لاگ ردیابی =====
    console.log(
      `%c[BaseRequest]  instantiated for URL: ${request.url}`,
      "color: #17a2b8;"
    );
    // ===== پایان لاگ ردیابی =====
  }

  /**
   * Validate the request data
   */
  async validate(): Promise<T> {
    if (this.data) {
      console.log(
        `%c[BaseRequest] ✅ Returning cached validation data.`,
        "color: #28a745;"
      );
      return this.data;
    }

    console.log(
      `%c[BaseRequest] 1. Starting validation...`,
      "color: #17a2b8; font-weight: bold;"
    );

    try {
      const body = await this.getBody();
      console.log(
        `%c[BaseRequest] 2. Body received, attempting to parse with Zod schema...`,
        "color: #17a2b8;"
      );
      this.data = this.schema.parse(body);
      console.log(
        `%c[BaseRequest] 3. ✅ Validation successful.`,
        "color: #28a745; font-weight: bold;",
        this.data
      );
      return this.data;
    } catch (error) {
      console.error(
        `%c[BaseRequest] ❌ Validation Failed!`,
        "color: #dc3545; font-weight: bold;",
        error
      );
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          const path = err.path.join(".");
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });

        throw new ValidationException(formattedErrors);
      }
      throw error;
    }
  }

  /**
   * Get the request body
   */
  protected async getBody(): Promise<any> {
    console.log(`[BaseRequest]   - Attempting to read request body as JSON...`);
    try {
      const body = await this.request.json();
      console.log(`[BaseRequest]     - Successfully parsed JSON body:`, body);
      return body;
    } catch (error) {
      console.error(`[BaseRequest]     - Failed to parse JSON body:`, error);
      return {}; // Return empty object on parsing failure to avoid downstream errors
    }
  }

  /**
   * Get a query parameter
   */
  getQueryParam(name: string): string | null {
    const { searchParams } = new URL(this.request.url);
    const value = searchParams.get(name);
    console.log(
      `[BaseRequest] Query Param requested: "${name}", Value: "${value}"`
    );
    return value;
  }

  /**
   * Get all query parameters
   */
  getAllQueryParams(): URLSearchParams {
    const { searchParams } = new URL(this.request.url);
    console.log(
      `[BaseRequest] All Query Params requested:`,
      Object.fromEntries(searchParams)
    );
    return searchParams;
  }

  /**
   * Get pagination parameters
   */
  getPaginationParams(): { page: number; limit: number } {
    const { searchParams } = new URL(this.request.url);
    const pageStr = searchParams.get("page") || "1";
    const limitStr = searchParams.get("limit") || "10";

    const page = parseInt(pageStr);
    const limit = parseInt(limitStr);

    const finalPage = isNaN(page) || page < 1 ? 1 : page;
    const finalLimit =
      isNaN(limit) || limit < 1 ? 10 : limit > 100 ? 100 : limit;

    console.log(
      `[BaseRequest] Pagination params requested: Raw (page: "${pageStr}", limit: "${limitStr}"), Parsed (page: ${finalPage}, limit: ${finalLimit})`
    );

    return {
      page: finalPage,
      limit: finalLimit,
    };
  }
}

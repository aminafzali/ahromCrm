// مسیر فایل: src/@Server/Http/Response/ApiResponse.ts

import { NextResponse } from "next/server";

export abstract class ApiResponse {
  static internalServerError(
    errorMessage: string = "Internal server error",
    error?: unknown
  ) {
    console.error(
      `%c[ApiResponse] ❌ Sending INTERNAL SERVER ERROR Response (Status: 500)`,
      "color: #dc3545; font-weight: bold;",
      { errorMessage, error }
    );
    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }

  /**
   * Create a success response
   */

  static success<T>(data: T, status: number = 200): NextResponse {
    // ===== شروع لاگ ردیابی =====
    console.log(
      `%c[ApiResponse] ✅ Sending SUCCESS Response (Status: ${status})`,
      "color: #28a745; font-weight: bold;",
      { data }
    );
    // ===== پایان لاگ ردیابی =====
    return NextResponse.json(data, { status });
  }

  /**
   * Create a created respon se (201)
   */
  static created<T>(data: T): NextResponse {
    // لاگ مربوطه در متد success ثبت خواهد شد
    return ApiResponse.success(data, 201);
  }

  /**
   * Create a no content response (204)
   */
  static noContent(): NextResponse {
    // ===== شروع لاگ ردیابی =====
    console.log(
      `%c[ApiResponse] ✅ Sending NO CONTENT Response (Status: 204)`,
      "color: #28a745; font-weight: bold;"
    );
    // ===== پایان لاگ ردیابی =====
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Create an error response
   */
  static error(
    message: string,
    status: number = 500,
    errors?: Record<string, string[]>
  ): NextResponse {
    const payload = {
      error: message,
      ...(errors && { errors }),
    };
    // ===== شروع لاگ ردیابی =====
    console.error(
      `%c[ApiResponse] ❌ Sending ERROR Response (Status: ${status})`,
      "color: #dc3545; font-weight: bold;",
      payload
    );
    // ===== پایان لاگ ردیابی =====
    return NextResponse.json(payload, { status });
  }

  /**
   * Create a not found response (404)
   */
  static notFound(message: string = "Resource not found"): NextResponse {
    return ApiResponse.error(message, 404);
  }

  /**
   * Create a bad request response (400)
   */
  static badRequest(
    message: string = "Bad request",
    errors?: Record<string, string[]>
  ): NextResponse {
    return ApiResponse.error(message, 400, errors);
  }

  /**
   * Create an unauthorized response (401)
   */
  static unauthorized(message: string = "Unauthorized"): NextResponse {
    return ApiResponse.error(message, 401);
  }

  /**
   * Create a forbidden response (403)
   */
  static forbidden(message: string = "Forbidden"): NextResponse {
    return ApiResponse.error(message, 403);
  }

  /**
   * Create a validation error response (422)
   */
  static validationError(errors: Record<string, string[]>): NextResponse {
    return ApiResponse.error("Validation failed", 422, errors);
  }
}

import { NextResponse } from 'next/server';

export abstract class ApiResponse {
  /**
   * Create a success response
   */
  static success<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
  }

  /**
   * Create a created response (201)
   */
  static created<T>(data: T): NextResponse {
    return ApiResponse.success(data, 201);
  }

  /**
   * Create a no content response (204)
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Create an error response
   */
  static error(message: string, status: number = 500, errors?: Record<string, string[]>): NextResponse {
    return NextResponse.json(
      { 
        error: message,
        ...(errors && { errors })
      }, 
      { status }
    );
  }

  /**
   * Create a not found response (404)
   */
  static notFound(message: string = 'Resource not found'): NextResponse {
    return ApiResponse.error(message, 404);
  }

  /**
   * Create a bad request response (400)
   */
  static badRequest(message: string = 'Bad request', errors?: Record<string, string[]>): NextResponse {
    return ApiResponse.error(message, 400, errors);
  }

  /**
   * Create an unauthorized response (401)
   */
  static unauthorized(message: string = 'Unauthorized'): NextResponse {
    return ApiResponse.error(message, 401);
  }

  /**
   * Create a forbidden response (403)
   */
  static forbidden(message: string = 'Forbidden'): NextResponse {
    return ApiResponse.error(message, 403);
  }

  /**
   * Create a validation error response (422)
   */
  static validationError(errors: Record<string, string[]>): NextResponse {
    return ApiResponse.error('Validation failed', 422, errors);
  }
}
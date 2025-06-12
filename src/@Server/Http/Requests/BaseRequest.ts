import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ValidationException } from '../../Exceptions/BaseException';

export abstract class BaseRequest<T> {
  protected schema: z.ZodType<T>;
  protected request: NextRequest;
  protected data: T | null = null;

  constructor(request: NextRequest, schema: z.ZodType<T>) {
    this.request = request;
    this.schema = schema;
  }

  /**
   * Validate the request data
   */
  async validate(): Promise<T> {
    if (this.data) {
      return this.data;
    }

    try {
      const body = await this.getBody();
      this.data = this.schema.parse(body);
      return this.data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
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
    try {
      return await this.request.json();
    } catch (error) {
      return error;
    }
  }

  /**
   * Get a query parameter
   */
  getQueryParam(name: string): string | null {
    const { searchParams } = new URL(this.request.url);
    return searchParams.get(name);
  }

  /**
   * Get all query parameters
   */
  getAllQueryParams(): URLSearchParams {
    const { searchParams } = new URL(this.request.url);
    return searchParams;
  }

  /**
   * Get pagination parameters
   */
  getPaginationParams(): { page: number; limit: number } {
    const { searchParams } = new URL(this.request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    return {
      page: isNaN(page) || page < 1 ? 1 : page,
      limit: isNaN(limit) || limit < 1 ? 10 : limit > 100 ? 100 : limit,
    };
  }
}
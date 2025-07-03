import { ApiError } from "../../Exceptions/ApiError";
import { FullQueryParams, PaginationResult } from "../../types";
import { BaseApi } from "../Controller/BaseApi";

export abstract class BaseRepository<T, ID = number> extends BaseApi {
  protected endpoint: string;

  constructor(endpoint: string) {
    super();
    this.endpoint = endpoint;
  }

  /**
   * Build query string from parameters
   */
  protected buildQueryString(params: Record<string, any> = {}): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "object" && !Array.isArray(value)) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null) {
              queryParams.append(`${key}[${subKey}]`, String(subValue));
            }
          });
        } else if (Array.isArray(value)) {
          value.forEach((item) => {
            queryParams.append(`${key}[]`, String(item));
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    return queryParams.toString();
  }

  /**
   * Get all records with pagination
   */
  async getAll(
    params: FullQueryParams = { page: 1, limit: 10 }
  ): Promise<PaginationResult<T>> {
    const queryString = this.buildQueryString(params);
    return this.get<PaginationResult<T>>(`${this.endpoint}?${queryString}`);
  }

  /**
   * Get a record by ID
   */
  async getById(id: ID): Promise<T> {
    return this.get<T>(`${this.endpoint}/${id}`);
  }

  /**
   * Get records by field value
   */
  async getBy(field: string, value: any): Promise<T[]> {
    const params = { [field]: value };
    const queryString = this.buildQueryString(params);
    return this.get<T[]>(`${this.endpoint}?${queryString}`);
  }

  /**
   * Create a new record
   */
  async create(data: any) {
    return this.post(this.endpoint, data);
  }

  /**
   * Update a record
   */
  async update<T>(id: ID, data: Partial<T>): Promise<T> {
    return this.patch<T>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Update a record
   */
  async Put(id: ID, data: Partial<T>): Promise<T> {
    return this.put<T>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete a record
   */
  async delete(id: ID): Promise<void> {
    return this.Delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Delete a record
   */
  async unlink(id: ID, data: any): Promise<void> {
    return this.patch<void>(`${this.endpoint}/${id}/link`, data);
  }

  /**
   * Delete a record
   */
  async link(id: ID, data: any): Promise<void> {
    return this.post<void>(`${this.endpoint}/${id}/link`, data);
  }

  /**
   * Update status
   */
  async updateStatus<T>(id: ID, data: Partial<T>): Promise<T> {
    console.log("id in baseRepository updateStatus ", id);
    console.log("data in baseRepository updateStatus ", data);
    console.log("endpoint in baseRepository updateStatus ", this.endpoint);

    return this.patch<T>(`${this.endpoint}/${id}/update-status`, data);
  }

  /**
   * Update a record
   */
  async createReminder(id: ID, data: Partial<T>): Promise<T> {
    return this.post<T>(`${this.endpoint}/${id}/reminders`, data);
  }

  /**
   * Handle API errors
   */
  protected handleError(error: unknown): never {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
}

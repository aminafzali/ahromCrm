import { ApiError } from "../../Exceptions/ApiError";

export class BaseApi {
  protected baseUrl: string;
  protected defaultHeaders: HeadersInit;

  constructor(baseUrl: string = "/api", defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
  }

  /**
   * Make a GET request
   */
  protected async get<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url);
  }

  /**
   * Make a POST request
   */
  protected async post<T>(endpoint: string, data: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Make a PUT request
   */
  protected async put<T>(endpoint: string, data: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Make a PATCH request
   */
  protected async patch<T>(endpoint: string, data: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * Make a DELETE request
   */
  protected async Delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "DELETE",
    });
  }

  /**
   * Build a URL with query parameters
   */
  private buildUrl(endpoint: string, params: Record<string, any> = {}): string {
    const url = new URL(
      `${this.baseUrl}/${
        endpoint.startsWith("/") ? endpoint.substring(1) : endpoint
      }`,
      window.location.origin
    );

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * Make a request with error handling
   */
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, mergedOptions);
      let data;

      //TODO: این خط باید پاک شود
      console.log(response);
      console.log(response.json);
      console.log(response.text);

      // Try to parse JSON response, but handle empty responses too
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
        if (!data) {
          data = { success: response.ok };
        } else {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // If it's not JSON, keep it as text
          }
        }
      }

      if (!response.ok) {
        throw new ApiError(
          data.error || "An error occurred",
          response.status,
          data.errors
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Network error",
        500
      );
    }
  }

  /**
   * Set authorization header
   */
  protected setAuthToken(token: string | null): void {
    if (token) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        Authorization: `Bearer ${token}`,
      };
    } else {
      const { ...headers } = this.defaultHeaders as Record<string, string>;
      this.defaultHeaders = headers;
    }
  }
}

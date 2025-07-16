// مسیر فایل: src/@Client/Http/Controller/BaseApi.ts (نسخه نهایی و کامل)

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

  protected async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url);
  }

  protected async post<T>(endpoint: string, data: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, { method: "POST", body: JSON.stringify(data) });
  }

  protected async put<T>(endpoint: string, data: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, { method: "PUT", body: JSON.stringify(data) });
  }

  protected async patch<T>(endpoint: string, data: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, { method: "PATCH", body: JSON.stringify(data) });
  }

  protected async Delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, { method: "DELETE" });
  }

  private buildUrl(endpoint: string, params: Record<string, any> = {}): string {
    const url = new URL(`${this.baseUrl}/${endpoint.startsWith("/") ? endpoint.substring(1) : endpoint}`, typeof window !== "undefined" ? window.location.origin : this.baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    // ++ منطق جدید برای اضافه کردن هدر ورک‌اسپیس ++
    const activeWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;

    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    if (activeWorkspaceId) {
      (mergedOptions.headers as Record<string, string>)['X-Workspace-Id'] = activeWorkspaceId;
    }
    // -- پایان منطق جدید --

    try {
      const response = await fetch(url, mergedOptions);
      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textData = await response.text();
        data = textData ? JSON.parse(textData) : { success: response.ok };
      }

      if (!response.ok) {
        throw new ApiError(data.error || "An error occurred", response.status, data.errors);
      }
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error instanceof Error ? error.message : "Network error", 500);
    }
  }
}
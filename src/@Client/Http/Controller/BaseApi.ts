// مسیر فایل: src/@Client/Http/Controller/BaseApi.ts
// (نسخه نهایی با حداقل تغییرات ضروری)

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

  protected async get<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
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
    return this.request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  protected async Delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, { method: "DELETE" });
  }

  private buildUrl(endpoint: string, params: Record<string, any> = {}): string {
    const url = new URL(
      `${this.baseUrl}/${
        endpoint.startsWith("/") ? endpoint.substring(1) : endpoint
      }`,
      typeof window !== "undefined" ? window.location.origin : this.baseUrl
    );
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    // ===== شروع اصلاحیه کلیدی =====
    // این کد به صورت خودکار قبل از هر درخواست اجرا می‌شود
    const activeWorkspaceId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeWorkspaceId")
        : null;

    const mergedOptions: RequestInit = {
      ...options,
      // ۱. به fetch می‌گوییم کوکی‌ها را برای احراز هویت ارسال کن
      credentials: "include",
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
        // ۲. هدر ورک‌اسپیس را به صورت هوشمند اضافه می‌کنیم
        ...(activeWorkspaceId && { "X-Workspace-Id": activeWorkspaceId }),
      },
    };
    // ===== پایان اصلاحیه کلیدی =====

    try {
      const response = await fetch(url, mergedOptions);

      if (response.status === 204) {
        // No Content
        return {} as T;
      }

      const textData = await response.text();
      const data = textData ? JSON.parse(textData) : { success: response.ok };

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
        error instanceof Error
          ? error.message
          : "A network or parsing error occurred",
        500
      );
    }
  }

  protected setAuthToken(token: string | null): void {
    if (token) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        Authorization: `Bearer ${token}`,
      };
    } else {
      const { Authorization, ...headers } = this.defaultHeaders as Record<
        string,
        string
      >;
      this.defaultHeaders = headers;
    }
  }
}

// مسیر فایل: src/@Client/Http/Controller/BaseApi.ts

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
    return this.request<T>(url, { method: "GET" });
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
    // ===== شروع لاگ ردیابی =====
    console.log(
      `%c[BaseApi - patch] 📞 Method called for endpoint: "${endpoint}"`,
      "color: #007acc;",
      { data }
    );
    // ===== پایان لاگ ردیابی =====

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
    const fullPath = `${this.baseUrl}/${
      endpoint.startsWith("/") ? endpoint.substring(1) : endpoint
    }`;

    const url = new URL(
      fullPath,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    );

    const appendParam = (key: string, value: any) => {
      if (value === undefined || value === null) return;

      const isObject =
        typeof value === "object" && !Array.isArray(value) && value !== null;

      if (isObject) {
        url.searchParams.append(key, JSON.stringify(value));
        return;
      }

      if (Array.isArray(value)) {
        url.searchParams.append(key, JSON.stringify(value));
        return;
      }

      url.searchParams.append(key, String(value));
    };

    console.log(`🔍 [CLIENT - BaseApi] Building URL with params:`, params);

    Object.entries(params).forEach(([key, value]) => {
      if (key === "filters") {
        console.log(`🔍 [CLIENT - BaseApi] Building URL with filters:`, value);
        console.log(`🔍 [CLIENT - BaseApi] Filters type:`, typeof value);
        console.log(
          `🔍 [CLIENT - BaseApi] Filters JSON:`,
          JSON.stringify(value)
        );
      }
      appendParam(key, value);
    });

    // ===== لاگ ردیابی ۱: بررسی URL ساخته شده =====
    console.log(
      `%c[CLIENT - BaseApi] 🔗 URL Built:`,
      "color: #007acc;",
      url.toString()
    );
    // بررسی filters در URL
    const filtersParam = url.searchParams.get("filters");
    console.log(`🔍 [CLIENT - BaseApi] Filters in URL:`, filtersParam);
    // ===========================================

    return url.toString();
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const activeWorkspaceId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeWorkspaceId")
        : null;

    const mergedOptions: RequestInit = {
      ...options,
      credentials: "include",
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
        ...(activeWorkspaceId && { "X-Workspace-Id": activeWorkspaceId }),
      },
    };

    // ===== لاگ ردیابی ۲: بررسی درخواست قبل از ارسال =====
    console.log(
      `%c[CLIENT - BaseApi] 🚀 Sending Request:`,
      "color: #007acc; font-weight: bold;",
      {
        method: options.method || "GET",
        url: url,
        headers: mergedOptions.headers,
      }
    );
    // ===================================================

    try {
      const response = await fetch(url, mergedOptions);

      // ===== لاگ ردیابی ۳: بررسی پاسخ خام دریافتی =====
      console.log(
        `%c[CLIENT - BaseApi] 📥 Received Raw Response:`,
        "color: #007acc; font-weight: bold;",
        {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        }
      );
      // =================================================

      if (response.status === 204) {
        return {} as T;
      }

      const textData = await response.text();

      // ===== لاگ ردیابی ۴: بررسی متن خام پاسخ قبل از پردازش =====
      console.log(
        `%c[CLIENT - BaseApi] 📄 Received Raw Text Data:`,
        "color: #007acc;",
        textData
      );
      // ========================================================

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
      // ===== لاگ ردیابی ۵: لاگ دقیق خطا در کلاینت =====
      console.error(
        `%c[CLIENT - BaseApi] ❌ Request Failed:`,
        "color: #dc3545; font-weight: bold;",
        error
      );
      // ==============================================

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

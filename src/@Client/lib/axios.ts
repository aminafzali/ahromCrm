// مسیر فایل: src/@Client/lib/axios.ts

import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api", // آدرس پایه تمام API های شما
  withCredentials: true, // این خط کلیدی، به axios می‌گوید کوکی‌های مربوط به session را ارسال کند
});

/**
 * Interceptor (رهگیر) درخواست‌ها:
 * این قطعه کد، قبل از ارسال هر درخواستی به سرور اجرا می‌شود.
 * وظیفه آن، خواندن شناسه فضای کاری فعال از حافظه مرورگر (localStorage)
 * و ضمیمه کردن آن به هدر درخواست است.
 * این همان "سیم وصلی" است که معماری کلاینت و سرور را به هم متصل می‌کند.
 */
apiClient.interceptors.request.use(
  (config) => {
    // ما workspaceId را هنگام انتخاب، در localStorage ذخیره کرده بودیم
    const activeWorkspaceId = localStorage.getItem("activeWorkspaceId");

    if (activeWorkspaceId) {
      config.headers["X-Workspace-Id"] = activeWorkspaceId;
    }

    return config;
  },
  (error) => {
    // در صورت بروز خطا در تنظیم درخواست، آن را برمی‌گردانیم
    return Promise.reject(error);
  }
);

export default apiClient;

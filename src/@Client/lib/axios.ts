// مسیر فایل: src/@Client/lib/axios.ts

import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api", // آدرس پایه تمام API های شما
  withCredentials: true, // ** این خط کلیدی، به axios می‌گوید کوکی‌ها را ارسال کن **
});

apiClient.interceptors.request.use((config) => {
  // هدر ورک‌اسپیس را به صورت خودکار به تمام درخواست‌ها اضافه می‌کنیم
  const activeWorkspaceId = localStorage.getItem("activeWorkspaceId");
  if (activeWorkspaceId) {
    config.headers["X-Workspace-Id"] = activeWorkspaceId;
  }
  return config;
});

export default apiClient;

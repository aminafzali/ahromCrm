// مسیر فایل: src/@Client/hooks/useWorkspaceCrud.ts

"use client";

import apiClient from "@/@Client/lib/axios";
import { workspaceSchema } from "@/@Server/services/workspaces/WorkspaceApiService";
import type { AxiosError } from "axios";
import { useToast } from "ndui-ahrom";
import { useCallback, useState } from "react";
import { z } from "zod";

type CreateWorkspaceInput = z.infer<typeof workspaceSchema>;

/**
 * این یک هوک کاملاً مستقل برای مدیریت عملیات CRUD ورک‌اسپیس‌ها است.
 */
export function useWorkspaceCrud() {
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const create = useCallback(
    async (data: CreateWorkspaceInput) => {
      setSubmitting(true);
      try {
        const response = await apiClient.post("/workspaces", data);
        showToast("ورک‌اسپیس با موفقیت ایجاد شد.", "success");
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<any>;
        const errorMessage =
          axiosError.response?.data?.error ||
          "خطایی در ایجاد ورک‌اسپیس رخ داد.";
        showToast(errorMessage, "error");
        // خطا را دوباره پرتاب می‌کنیم تا کامپوننت فرم از آن مطلع شود
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [showToast]
  );

  // در آینده می‌توانید متدهای update, delete و ... را نیز به همین شکل اضافه کنید

  return { create, submitting };
}

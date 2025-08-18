// مسیر فایل: src/modules/requests/hooks/usePublicRequest.ts

"use client";

import { useState } from "react";
 import { toast } from "react-toastify";

export const usePublicRequest = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const create = async (data: any) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // ===== شروع اصلاحیه: آدرس API به‌روز شد =====
      const response = await fetch("/api/public/requests", {
        // ==========================================
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در ارسال درخواست");
      }

        toast.success("درخواست شما با موفقیت ثبت شد.");
      setSuccess("درخواست با موفقیت ثبت شد.");
      return result;
    } catch (err: any) {
      setError(err.message);
         toast.error(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { create, submitting, error, success, setError };
};

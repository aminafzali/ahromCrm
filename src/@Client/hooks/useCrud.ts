// مسیر فایل: src/@Client/hooks/useCrud.ts

import { ApiError } from "@/@Client/Exceptions/ApiError";
import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { FullQueryParams, PaginationResult } from "@/@Client/types";
import { useToast } from "ndui-ahrom";
import { useCallback, useEffect, useState } from "react";
import { useWorkspace } from "../context/WorkspaceProvider";

export function useCrud<
  T,
  CreateInput = any,
  UpdateInput = any,
  UpdateStatus = any
>(repository: BaseRepository<T, number>) {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatus] = useState<number>(0);
  const [success, setSuccess] = useState<string | null>(null);
  const { showToast } = useToast();
  const { activeWorkspace } = useWorkspace();

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [activeWorkspace]);

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        setError(error.message);
        setStatus(error.statusCode);
        showToast(error.message, "error");
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setError(errorMessage);
        showToast(errorMessage, "error");
      }
    },
    [showToast]
  );

  const getAll = useCallback(
    // ===== شروع اصلاحیه کلیدی =====
    // ما یک نوع بازگشتی صریح برای تابع تعریف می‌کنیم
    async (
      params: FullQueryParams = { page: 1, limit: 10 }
    ): Promise<PaginationResult<T>> => {
      // اگر ورک‌اسپیس فعال نبود، به جای undefined، یک نتیجه خالی و معتبر برمی‌گردانیم
      if (!activeWorkspace) {
        return Promise.resolve({
          data: [],
          pagination: { total: 0, pages: 1, page: 1, limit: 10 },
        });
      }
      // ===== پایان اصلاحیه کلیدی =====

      setLoading(true);
      setError(null);
      try {
        const data: PaginationResult<T> = await repository.getAll(params);
        return data;
      } catch (error) {
        handleError(error);
        // در صورت خطا نیز یک نتیجه خالی برمی‌گردانیم تا از کرش جلوگیری شود
        return {
          data: [],
          pagination: { total: 0, pages: 1, page: 1, limit: 10 },
        };
      } finally {
        setLoading(false);
      }
    },
    [repository, handleError, activeWorkspace]
  );

  const getById = useCallback(
    // برای getById، بازگرداندن null در صورت خطا منطقی است
    async (id: number): Promise<T | null> => {
      if (!activeWorkspace) return null;
      setLoading(true);
      setError(null);
      try {
        const data: T = await repository.getById(id);
        return data;
      } catch (error) {
        handleError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [repository, handleError, activeWorkspace]
  );

  // ... تمام متدهای دیگر (create, update, remove, etc.) بدون تغییر باقی می‌مانند ...

  const create = useCallback(
    async (data: CreateInput) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.create(data);
        setSuccess("با موفقیت ایجاد شد");
        showToast("با موفقیت ایجاد شد", "success");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository, handleError, showToast]
  );

  const update = useCallback(
    async (id: number, data: UpdateInput) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.update<UpdateInput>(id, data);
        setSuccess("با موفقیت به‌روزرسانی شد");
        showToast("با موفقیت به‌روزرسانی شد", "info");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository, handleError, showToast]
  );

  const Put = useCallback(
    async (id: number, data: any) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.Put(id, data);
        setSuccess("با موفقیت به‌روزرسانی شد");
        showToast("با موفقیت به‌روزرسانی شد", "info");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository, handleError, showToast]
  );

  const link = useCallback(
    async (id: number, data: any) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.link(id, data);
        setSuccess("با موفقیت به‌روزرسانی شد");
        showToast("با موفقیت به‌روزرسانی شد", "info");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository, handleError, showToast]
  );

  const unlink = useCallback(
    async (id: number, data: any) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.unlink(id, data);
        setSuccess("با موفقیت به‌روزرسانی شد");
        showToast("با موفقیت به‌روزرسانی شد", "info");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository, handleError, showToast]
  );

  const remove = useCallback(
    async (id: number) => {
      setSubmitting(true);
      setError(null);
      try {
        await repository.delete(id);
        setSuccess("با موفقیت حذف شد");
        showToast("با موفقیت حذف شد", "error");
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository, handleError, showToast]
  );

  const updateStatus = useCallback(
    async (id: number, data: UpdateStatus) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.updateStatus<UpdateStatus>(id, data);
        setSuccess("وضعیت با موفقیت بروزرسانی شد");
        showToast("وضعیت با موفقیت بروزرسانی شد", "warning");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository, handleError, showToast]
  );

  const createReminder = useCallback(
    async (data: any) => {
      setSubmitting(true);
      setError(null);
      try {
        const result = await repository.createReminder(data.entityId, data);
        setSuccess("یادآور با موفقیت ایجاد شد");
        showToast("یادآور با موفقیت ایجاد شد", "success");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository, handleError, showToast]
  );

  return {
    statusCode,
    loading,
    error,
    success,
    getAll,
    getById,
    create,
    update,
    remove,
    setError,
    setSuccess,
    setLoading,
    handleError,
    updateStatus,
    submitting,
    setSubmitting,
    link,
    unlink,
    Put,
    createReminder,
  };
}

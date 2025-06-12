import { ApiError } from "@/@Client/Exceptions/ApiError";
import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { FullQueryParams, PaginationResult } from "@/@Client/types";
import { useToast } from "ndui-ahrom";
import { useCallback, useState } from "react";

/**
 * هوک جنریک برای مدیریت عملیات CRUD
 */
export function useCrud<
  T, 
  CreateInput = any, 
  UpdateInput = any, 
  UpdateStatus = any,
  createFormSchema = any,
>(
  repository: BaseRepository<T, number>
) {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatus] = useState<number>(0);
  const [success, setSuccess] = useState<string | null>(null);
  const { showToast } = useToast(); // دریافت متد نمایش پیام

  /**
   * دریافت لیست ‌ها
   */
  const getAll = useCallback(
    async (params: FullQueryParams = { page: 1, limit: 10 }) => {
      setLoading(true);
      setError(null);
      try {
        const data: PaginationResult<T> = await repository.getAll(params);
        return data;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  /**
   * دریافت یک  بر اساس ID
   */
  const getById = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const data: T = await repository.getById(id);
        return data;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  /**
   * ایجاد  جدید
   */
  const create = useCallback(
    async (data: any) => {
      // setLoading(true);
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.create(data);
        setSuccess(" با موفقیت ایجاد شد");
        showToast(" با موفقیت ایجاد شد" , "success");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        // setLoading(false);
        setSubmitting(false);
      }
    },
    [repository]
  );

  /**
   * به‌روزرسانی 
   */
  const update = useCallback(
    async (id: number, data: UpdateInput) => {
      // setLoading(true);
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.update<UpdateInput>(id, data);
        setSuccess(" با موفقیت به‌روزرسانی شد");
        showToast(" با موفقیت به‌روزرسانی شد" , "info");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository]
  );
  /**
   * به‌روزرسانی 
   */
  const Put = useCallback(
    async (id: number, data: any) => {
      // setLoading(true);
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.Put(id, data);
        setSuccess(" با موفقیت به‌روزرسانی شد");
        showToast(" با موفقیت به‌روزرسانی شد" , "info");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository]
  );

  /**
   * به‌روزرسانی 
   */
  const link = useCallback(
    async (id: number, data: any) => {
      // setLoading(true);
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.link(id, data);
        setSuccess(" با موفقیت به‌روزرسانی شد");
        showToast(" با موفقیت به‌روزرسانی شد" , "info");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository]
  );


  /**
   * به‌روزرسانی 
   */
  const unlink = useCallback(
    async (id: number, data: any) => {
      // setLoading(true);
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.unlink(id, data);
        setSuccess(" با موفقیت به‌روزرسانی شد");
        showToast(" با موفقیت به‌روزرسانی شد" , "info");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository]
  );

  /**
   * حذف 
   */
  const remove = useCallback(
    async (id: number) => {
      setSubmitting(true);
      setError(null);
      try {
        await repository.delete(id);
        setSuccess(" با موفقیت حذف شد");
        showToast(" با موفقیت حذف شد" , "error");
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [repository]
  );

  /**
   * Update status
   */
  const updateStatus = useCallback(
    async (id: number, data: UpdateStatus) => {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await repository.updateStatus<UpdateStatus>(id, data);
        setSuccess("وضعیت با موفقیت بروزرسانی شد");
        showToast("وضعیت با موفقیت بروزرسانی شد" , "warning");
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  /**
   * مدیریت خطاها
   */
  const handleError = (error: unknown) => {
    if (error instanceof ApiError) {
      setError(error.message);
      setStatus(error.statusCode)
    } else {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };


  const createReminder = async (data: any) => {
    try {
      return await repository.createReminder(data.entityId, data);
    } catch (error) {
      throw error;
    }
  };


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

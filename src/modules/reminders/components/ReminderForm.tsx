// مسیر فایل: src/modules/reminders/components/ReminderForm.tsx

"use client";

import { useReminder } from "../hooks/useReminder";
import { createReminderSchema } from "../validation/schema";
import SelectUserForReminder from "./SelectUserForReminder";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UserWithRelations } from "@/modules/users/types";
import { useState } from "react";

export default function ReminderForm() {
  const router = useRouter();
  const { create, loading } = useReminder();
  
  // ** State برای نگهداری آبجکت کامل کاربر انتخاب‌شده **
  const [selectedUser, setSelectedUser] = useState<UserWithRelations | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof createReminderSchema>>({
    resolver: zodResolver(createReminderSchema),
  });

  // ** تابعی که با انتخاب کاربر از مودال، اجرا می‌شود **
  const handleUserSelect = (user: UserWithRelations) => {
    setSelectedUser(user);
    // مقدار فیلد userId را در react-hook-form به صورت برنامه‌نویسی ست می‌کنیم
    setValue("userId", user.id, { shouldValidate: true });
  };

  const handleSave = async (data: z.infer<typeof createReminderSchema>) => {
    const result = await create(data);
    if (result) {
      router.push("/dashboard/reminders");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <div className="row g-3">
        <div className="col-12">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              عنوان یادآور <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              {...register("title")}
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title.message}</div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              برای کاربر <span className="text-danger">*</span>
            </label>
            {/* کامپوننت جدید انتخاب کاربر در اینجا استفاده می‌شود */}
            <SelectUserForReminder
              onSelect={handleUserSelect}
              selectedUserName={selectedUser?.name || selectedUser?.phone}
            />
            {errors.userId && (
              <p className="text-danger mt-1 small">{errors.userId.message}</p>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              تاریخ و زمان یادآوری <span className="text-danger">*</span>
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
              {...register("dueDate")}
            />
            {errors.dueDate && (
              <div className="invalid-feedback">{errors.dueDate.message}</div>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="form-group">
            <label htmlFor="description" className="form-label">توضیحات (اختیاری)</label>
            <textarea
              id="description"
              className="form-control"
              rows={4}
              {...register("description")}
            ></textarea>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 pt-4 mt-4 border-top">
        <button
          type="button"
          className="btn btn-light"
          onClick={() => router.back()}
          disabled={loading}
        >
          انصراف
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              در حال ذخیره...
            </>
          ) : (
            "ایجاد یادآور"
          )}
        </button>
      </div>
    </form>
  );
}
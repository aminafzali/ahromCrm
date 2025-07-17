// مسیر فایل: src/modules/workspaces/components/WorkspaceForm.tsx

"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useWorkspaceCrud } from "../hooks/useWorkspaceCrud";
import { workspaceSchema } from "../validation/schema";

export default function WorkspaceForm() {
  const router = useRouter();
  // هوک context برای رفرش کردن لیست ورک‌اسپیس‌ها پس از ایجاد
  const { refetchWorkspaces } = useWorkspace();
  // هوک CRUD برای ارسال داده به سرور
  const { create, submitting } = useWorkspaceCrud();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof workspaceSchema>>({
    resolver: zodResolver(workspaceSchema),
  });

  const handleSave = async (data: z.infer<typeof workspaceSchema>) => {
    const result = await create(data);
    if (result) {
      // پس از ایجاد موفق، لیست ورک‌اسپیس‌ها را دوباره فراخوانی می‌کنیم
      refetchWorkspaces();
      router.push("/dashboard/workspaces");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              نام ورک‌اسپیس <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              {...register("name")}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="slug" className="form-label">
              اسلاگ (آدرس یکتا) <span className="text-danger">*</span>
            </label>
            <input
              id="slug"
              type="text"
              className={`form-control ${errors.slug ? "is-invalid" : ""}`}
              {...register("slug")}
            />
            {errors.slug && (
              <div className="invalid-feedback">{errors.slug.message}</div>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 pt-4 mt-4 border-top">
        <button
          type="button"
          className="btn btn-light"
          onClick={() => router.back()}
          disabled={submitting}
        >
          انصراف
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "در حال ذخیره..." : "ایجاد ورک‌اسپیس"}
        </button>
      </div>
    </form>
  );
}

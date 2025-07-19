// مسیر فایل: src/app/workspaces/_components/WorkspaceForm.tsx

"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useWorkspaceCrud } from "@/@Client/hooks/useWorkspaceCrud";
import { workspaceSchema } from "@/@Server/services/workspaces/WorkspaceApiService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function WorkspaceForm() {
  const router = useRouter();
  const { refetchWorkspaces } = useWorkspace();
  const { create, submitting } = useWorkspaceCrud();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof workspaceSchema>>({
    resolver: zodResolver(workspaceSchema),
  });

  const handleSave = async (data: z.infer<typeof workspaceSchema>) => {
    try {
      const result = await create(data);
      if (result) {
        await refetchWorkspaces();
        // ++ اصلاحیه: هدایت به آدرس جدید و صحیح ++
        router.push("/workspaces");
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
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
            <div className="invalid-feedback">{errors.name?.message}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="slug" className="form-label">
              شناسه یکتا (در URL) <span className="text-danger">*</span>
            </label>
            <input
              id="slug"
              type="text"
              className={`form-control ${errors.slug ? "is-invalid" : ""}`}
              {...register("slug")}
            />
            <div className="invalid-feedback">{errors.slug?.message}</div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 pt-4 mt-4 border-top">
        <button
          type="button"
          className="btn btn-light"
          onClick={() => router.push("/workspaces")}
          disabled={submitting}
        >
          انصراف
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "در حال ساخت..." : "ایجاد ورک‌اسپیس"}
        </button>
      </div>
    </form>
  );
}

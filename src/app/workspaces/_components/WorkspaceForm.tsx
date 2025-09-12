// // مسیر فایل: src/app/workspaces/_components/WorkspaceForm.tsx
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
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-6">
        {/* header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            ایجاد فضای کاری
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            یک فضای کاری جدید بسازید تا اعضا و پروژه‌ها را مجزا مدیریت کنید.
          </p>
        </div>

        {/* inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              نام فضای کاری <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:shadow-outline ${
                errors.name
                  ? "border-rose-400 bg-rose-50"
                  : "border-gray-200 bg-white"
              }`}
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
            />
            <div className="mt-1 text-xs text-rose-600 min-h-[1rem]">
              {errors.name?.message}
            </div>
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              شناسه یکتا (در URL) <span className="text-rose-500">*</span>
            </label>
            <input
              id="slug"
              type="text"
              className={`w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:shadow-outline ${
                errors.slug
                  ? "border-rose-400 bg-rose-50"
                  : "border-gray-200 bg-white"
              }`}
              {...register("slug")}
              aria-invalid={errors.slug ? "true" : "false"}
            />
            <div className="mt-1 text-xs text-rose-600 min-h-[1rem]">
              {errors.slug?.message}
            </div>
          </div>
        </div>

        {/* footer actions */}
        <div className="mt-6 pt-4 border-t flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-60"
            onClick={() => router.push("/workspaces")}
            disabled={submitting}
          >
            انصراف
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "در حال ساخت..." : "ایجاد فضای کاری"}
          </button>
        </div>
      </div>
    </form>
  );
}

// "use client";

// import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
// import { useWorkspaceCrud } from "@/@Client/hooks/useWorkspaceCrud";
// import { workspaceSchema } from "@/@Server/services/workspaces/WorkspaceApiService";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// export default function WorkspaceForm() {
//   const router = useRouter();
//   const { refetchWorkspaces } = useWorkspace();
//   const { create, submitting } = useWorkspaceCrud();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<z.infer<typeof workspaceSchema>>({
//     resolver: zodResolver(workspaceSchema),
//   });

//   const handleSave = async (data: z.infer<typeof workspaceSchema>) => {
//     try {
//       const result = await create(data);
//       if (result) {
//         await refetchWorkspaces();
//         // ++ اصلاحیه: هدایت به آدرس جدید و صحیح ++
//         router.push("/workspaces");
//       }
//     } catch (error) {
//       console.error("Failed to create workspace:", error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(handleSave)} noValidate>
//       <div className="row g-3">
//         <div className="col-md-6">
//           <div className="form-group">
//             <label htmlFor="name" className="form-label">
//               نام ورک‌اسپیس <span className="text-danger">*</span>
//             </label>
//             <input
//               id="name"
//               type="text"
//               className={`form-control ${errors.name ? "is-invalid" : ""}`}
//               {...register("name")}
//             />
//             <div className="invalid-feedback">{errors.name?.message}</div>
//           </div>
//         </div>
//         <div className="col-md-6">
//           <div className="form-group">
//             <label htmlFor="slug" className="form-label">
//               شناسه یکتا (در URL) <span className="text-danger">*</span>
//             </label>
//             <input
//               id="slug"
//               type="text"
//               className={`form-control ${errors.slug ? "is-invalid" : ""}`}
//               {...register("slug")}
//             />
//             <div className="invalid-feedback">{errors.slug?.message}</div>
//           </div>
//         </div>
//       </div>
//       <div className="d-flex justify-content-end gap-2 pt-4 mt-4 border-top">
//         <button
//           type="button"
//           className="btn btn-light"
//           onClick={() => router.push("/workspaces")}
//           disabled={submitting}
//         >
//           انصراف
//         </button>
//         <button type="submit" className="btn btn-primary" disabled={submitting}>
//           {submitting ? "در حال ساخت..." : "ایجاد ورک‌اسپیس"}
//         </button>
//       </div>
//     </form>
//   );
// }

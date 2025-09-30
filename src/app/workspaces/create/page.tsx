// // مسیر فایل: src/app/workspaces/create/page.tsx
// مسیر فایل: src/app/workspaces/create/page.tsx
"use client";
import WorkspaceForm from "../_components/WorkspaceForm";

export default function WorkspaceCreatePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full" style={{ maxWidth: 700 }}>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h4 className="text-lg font-medium mb-0">ایجاد فضای کاری جدید</h4>
          </div>

          <div className="p-6">
            <p className="text-muted mb-4 text-sm text-gray-600">
              یک فضای کاری جدید بسازید. شما به عنوان مالک آن شناخته خواهید شد.
            </p>

            <WorkspaceForm />
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";
// import WorkspaceForm from "../_components/WorkspaceForm";

// export default function WorkspaceCreatePage() {
//   return (
//     <div className="card w-100" style={{ maxWidth: "700px" }}>
//       <div className="card-header">
//         <h4 className="card-title mb-0">ایجاد ورک‌اسپیس جدید</h4>
//       </div>
//       <div className="card-body p-4">
//         <p className="text-muted mb-4">
//           یک فضای کاری جدید بسازید. شما به عنوان مالک آن شناخته خواهید شد.
//         </p>
//         <WorkspaceForm />
//       </div>
//     </div>
//   );
// }

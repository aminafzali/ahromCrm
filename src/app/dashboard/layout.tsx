// مسیر فایل: src/app/dashboard/layout.tsx (نسخه نهایی و کامل)

"use client"; // این فایل باید کلاینت باشد تا از هوک‌های useSession و useContext پشتیبانی کند

import { WorkspaceProvider } from "@/@Client/context/WorkspaceProvider";
import DashboardComponentLayout from "@/components/Dashboard/layout";
import AuthProvider from "@/providers/AuthProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // ترتیب پروایدرها مهم است. ابتدا Auth و سپس Workspace
    <AuthProvider>
      <WorkspaceProvider>
        {/* ما کامپوننت بصری شما را در داخل پروایدرها قرار می‌دهیم */}
        <DashboardComponentLayout>{children}</DashboardComponentLayout>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

// // مسیر فایل: src/app/dashboard/layout.tsx (نسخه نهایی و کامل)

// "use client";

// // ++ اصلاحیه: تغییر ایمپورت از named به default ++
// import { WorkspaceProvider } from "@/@Client/context/WorkspaceProvider";
// import DashboardClientLayout from "@/components/Dashboard/DashboardClientLayout";
// import AuthProvider from "@/providers/AuthProvider";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <AuthProvider>
//       <WorkspaceProvider>
//         <DashboardClientLayout>{children}</DashboardClientLayout>
//       </WorkspaceProvider>
//     </AuthProvider>
//   );
// }

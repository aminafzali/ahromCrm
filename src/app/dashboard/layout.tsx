// مسیر فایل: src/app/dashboard/layout.tsx (نسخه نهایی و کامل)

"use client";

// ++ اصلاحیه: تغییر ایمپورت از named به default ++
import { WorkspaceProvider } from "@/@Client/context/WorkspaceProvider";
import DashboardClientLayout from "@/components/Dashboard/DashboardClientLayout";
import AuthProvider from "@/providers/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <DashboardClientLayout>{children}</DashboardClientLayout>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

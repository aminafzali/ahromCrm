// مسیر فایل: src/app/select-workspace/layout.tsx (فایل جدید و نهایی)

"use client";

import { WorkspaceProvider } from "@/@Client/context/WorkspaceProvider";
import  AuthProvider  from "@/providers/AuthProvider";

/**
 * این Layout اختصاصی، تضمین می‌کند که صفحه "انتخاب ورک‌اسپیس"
 * به Provider های لازم دسترسی دارد.
 */
export default function SelectWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </AuthProvider>
  );
}

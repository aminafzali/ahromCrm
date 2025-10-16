// مسیر فایل: src/app/dashboard/layout.tsx (نسخه نهایی و کامل)

"use client"; // این فایل باید کلاینت باشد تا از هوک‌های useSession و useContext پشتیبانی کند

import { WorkspaceProvider } from "@/@Client/context/WorkspaceProvider";
import DashboardComponentLayout from "@/components/Dashboard/layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // AuthProvider در root layout وجود دارد، نیازی به تکرار نیست
    <WorkspaceProvider>
      {/* ما کامپوننت بصری شما را در داخل پروایدرها قرار می‌دهیم */}
      <DashboardComponentLayout>{children}</DashboardComponentLayout>
    </WorkspaceProvider>
  );
}

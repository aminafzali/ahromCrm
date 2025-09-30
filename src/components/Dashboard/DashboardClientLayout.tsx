// مسیر فایل: src/components/Dashboard/DashboardClientLayout.tsx

"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { dashboardBottomItems, dashboardMenuItems } from "@/lib/data";
import { LayoutWrapper, ToastContainer, ToastProvider } from "ndui-ahrom";
import DashboardToolBar from "./DashboardToolBar";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const sidebarContent = (
  <div className="mb-1">
    <h1 className="text-md font-bold mb-2">پنل مدیریت</h1>
  </div>
);

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeWorkspace } = useWorkspace();

  // ساخت داینامیک محتوای تولبار
  // ما انتخابگر ورک‌اسپیس را به تولبار فعلی شما اضافه می‌کنیم
  const toolbarContent = (
    <div className="w-100 d-flex justify-content-between align-items-center">
      <div>
        {/* این کامپوننت فقط زمانی نمایش داده می‌شود که ورک‌اسپیس فعال وجود داشته باشد */}
        {activeWorkspace && <WorkspaceSwitcher />}
      </div>
      <DashboardToolBar />
    </div>
  );

  return (
    <ToastProvider>
      <LayoutWrapper
        drawerHeader={sidebarContent}
        toolbarContent={toolbarContent} // استفاده از تولبار جدید و داینامیک
        drawerMenuItems={dashboardMenuItems}
        bottomBarItems={dashboardBottomItems}
        rtl
        classNameToolbar="w-[97%] mx-auto mt-2 rounded-lg border-[1px] border-gray-300 bg-white px-1 print:hidden"
        bgColor="bg-white"
        activeClass="bg-primary text-white"
        breakpoint={1024}
        elevatedToolbar={false}
      >
        <div className="p-2 min-h-screen px-4 bg-base-100 pb-24">
          {children}
        </div>
        <ToastContainer position="top-center" />
      </LayoutWrapper>
    </ToastProvider>
  );
}

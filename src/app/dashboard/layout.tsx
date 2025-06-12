"use client";

import DashboardToolBar from "@/components/Dashboard/DashboardToolBar";
import { dashboardBottomItems, dashboardMenuItems } from "@/lib/data";
import { LayoutWrapper, ToastContainer, ToastProvider } from "ndui-ahrom";

const sidebarContent = (
  <div className="mb-1">
    <h1 className="text-md font-bold mb-2">پنل مدیریت</h1>
  </div>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <LayoutWrapper
        drawerHeader={sidebarContent}
        toolbarContent={DashboardToolBar()}
        drawerMenuItems={dashboardMenuItems}
        bottomBarItems={dashboardBottomItems}
        rtl
        classNameToolbar="w-[97%] mx-auto mt-2 rounded-lg border-[1px] border-gray-300  bg-white px-1 print:hidden"
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

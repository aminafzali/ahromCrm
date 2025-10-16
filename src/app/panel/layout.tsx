"use client";

export const dynamic = "force-dynamic";

import DIcon from "@/@Client/Components/common/DIcon";
import {
  useWorkspace,
  WorkspaceProvider,
} from "@/@Client/context/WorkspaceProvider";
import { userBottomItems, userMenuItems } from "@/lib/data";
import {
  Button,
  LayoutWrapper,
  ToastContainer,
  ToastProvider,
} from "ndui-ahrom";
import { signOut } from "next-auth/react";

const sidebarContent = (
  <div className="mb-8">
    <h1 className="text-2xl font-bold mb-2">پنل کاربری</h1>
    <p className="text-sm text-gray-600">مدیریت درخواست‌های شما</p>
  </div>
);

function Toolbar() {
  // const PanelSupportButton = NextDynamic(
  //   () => import("@/modules/chat/components/PanelSupportButton"),
  //   { ssr: false }
  // );
  const { activeWorkspace } = useWorkspace();
  return (
    <div className="flex gap-2 justify-between w-full">
      <p className="text-lg font-semibold">پنل کاربری</p>

      <div className="flex items-center gap-2">
        {/* TODO: Add support-chat button */}
        {/* {activeWorkspace?.id ? (
          <PanelSupportButton
            workspaceId={activeWorkspace.id}
            className="btn btn-ghost"
          />
        ) : null} */}
        <Button
          className="text-primary"
          variant="ghost"
          icon={<DIcon icon="fa-left-from-bracket" classCustom="ml-2" />}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          خروج
        </Button>
      </div>
    </div>
  );
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <LayoutWrapper
        drawerHeader={sidebarContent}
        toolbarContent={<Toolbar />}
        drawerMenuItems={userMenuItems}
        bottomBarItems={userBottomItems}
        showBottomBar
        rtl
        activeClass="bg-primary text-white"
        breakpoint={1024}
        className="bg-white"
      >
        <div className="px-4 pt-2 min-h-screen md:p-6 bg-base-100  pb-20">
          {/* AuthProvider در root layout وجود دارد، فقط ToastProvider نیاز است */}
          <ToastProvider>
            {children}
            <ToastContainer position="top-center" />
          </ToastProvider>
        </div>
      </LayoutWrapper>
    </WorkspaceProvider>
  );
}

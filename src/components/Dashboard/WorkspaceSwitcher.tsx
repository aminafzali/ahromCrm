// مسیر فایل: src/components/Dashboard/WorkspaceSwitcher.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "ndui-ahrom";
import { useRouter } from "next/navigation";

export default function WorkspaceSwitcher() {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();
  const router = useRouter();

  if (!activeWorkspace) {
    return (
      <Button
        className="btn-primary btn-sm"
        onClick={() => router.push("/dashboard/workspaces/create")}
      >
        <DIcon icon="fa-plus" cdi={false} classCustom="me-2" />
        ایجاد اولین ورک‌اسپیس
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="btn btn-ghost d-flex align-items-center justify-content-between w-30">
          <span className="truncate font-bold">
            {activeWorkspace.workspace.name}
          </span>
          <DIcon icon="fa-chevron-down" cdi={false} classCustom="ms-2" />
        </Button>
      </DropdownMenuTrigger>
      {/* ===== شروع اصلاحیه ۱: سفید کردن بک‌گراند ===== */}
      <DropdownMenuContent
        className="w-56 bg-white dark:bg-gray-800"
        align="end"
        forceMount
      >
        {/* ===== پایان اصلاحیه ۱ ===== */}
        <DropdownMenuLabel>ورک‌اسپیس‌های من</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.workspaceId}
              onSelect={() => {
                if (ws.workspaceId !== activeWorkspace.workspaceId) {
                  setActiveWorkspace(ws);
                  // ===== شروع اصلاحیه ۲: رفرش کردن صفحه =====
                  window.location.reload();
                  // ===== پایان اصلاحیه ۲ =====
                }
              }}
              className="cursor-pointer"
            >
              <span className="flex-grow-1">{ws.workspace.name}</span>
              {ws.workspaceId === activeWorkspace.workspaceId && (
                <DIcon
                  icon="fa-check"
                  cdi={false}
                  classCustom="text-success ms-2"
                />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => router.push("/dashboard/workspaces/create")}
          className="cursor-pointer"
        >
          <DIcon icon="fa-plus-circle" cdi={false} classCustom="me-2" />
          ایجاد ورک‌اسپیس جدید
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

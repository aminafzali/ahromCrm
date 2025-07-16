// مسیر فایل: src/components/Dashboard/WorkspaceSwitcher.tsx (نسخه نهایی و کامل)

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { Button } from "ndui-ahrom";
import { useRouter } from "next/navigation";
// ** ایمپورت از کامپوننت جدید و استاندارد ما **
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <Button className="btn btn-ghost d-flex align-items-center justify-content-between w-56">
          <span className="truncate font-bold">
            {activeWorkspace.workspace.name}
          </span>
          <DIcon
            icon="fa-chevron-down"
            cdi={false}
            classCustom="ms-2 opacity-50"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>ورک‌اسپیس‌های من</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.workspaceId}
              onSelect={() => {
                if (ws.workspaceId !== activeWorkspace.workspaceId) {
                  setActiveWorkspace(ws);
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

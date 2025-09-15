"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ITeam } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Button from "@/@Client/Components/ui/Button2";

// You might want a delete confirmation dialog hook here
// const { confirm } = useConfirmDialog();
// const handleDelete = async () => {
//   if (await confirm("Are you sure?")) {
//     // delete logic
//   }
// };


export const columns: ColumnDef<ITeam>[] = [
  {
    accessorKey: "name",
    header: "نام تیم",
  },
  {
    header: "تعداد اعضا",
    accessorKey: "_count.members",
  },
  {
    header: "پروژه‌ها",
    accessorKey: "_count.assignedProjects",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const team = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">باز کردن منو</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>عملیات</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/teams/view/${team.id}`}>مشاهده</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/teams/view/${team.id}/update`}>ویرایش</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              // onClick={handleDelete}
            >
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
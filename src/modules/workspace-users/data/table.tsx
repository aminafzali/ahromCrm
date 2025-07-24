// مسیر فایل: src/modules/workspace-users/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

// الگوبرداری دقیق از ماژول brands
export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "user.name", // دسترسی به نام از طریق رابطه
    label: "نام عضو",
    render: (row) => row.user?.name || "-", // نمایش نام کاربر
  },
  {
    name: "phone",
    field: "user.phone", // دسترسی به تلفن از طریق رابطه
    label: "شماره تلفن",
    render: (row) => row.user?.phone || "-", // نمایش شماره تلفن
  },
  {
    name: "role",
    field: "role.name", // دسترسی به نقش از طریق رابطه
    label: "نقش",
    render: (row) => row.role?.name || "-", // نمایش نام نقش
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        // شناسه صحیح (id از خود رکورد WorkspaceUser) پاس داده می‌شود
        row={row}
        // در این ماژول، فقط ویرایش (تغییر نقش) و حذف منطقی است
        actions={["edit", "delete"]}
        // مسیرها متناسب با ماژول جدید تنظیم شده‌اند
        onEdit={`/dashboard/workspace-users/${row.id}/update`}
        showLabels
      />
    ),
  },
];

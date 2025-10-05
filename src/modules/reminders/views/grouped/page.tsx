"use client";

import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { FilterOption } from "@/@Client/types";
import { useReminder } from "@/modules/reminders/hooks/useReminder";
import Link from "next/link";

// ستون‌های مخصوص نمایش گروه‌بندی شده
const groupedColumns = [
  {
    name: "reminderNumber",
    field: "reminderNumber",
    label: "شماره یادآور",
    render: (row: any) => (
      <span className="font-mono text-sm font-bold text-blue-600">
        {row.reminderNumber}
      </span>
    ),
  },
  {
    name: "groupName",
    field: "groupName",
    label: "نام گروه",
    render: (row: any) => (
      <span className="font-medium text-gray-800">
        {row.groupName || "بدون نام گروه"}
      </span>
    ),
  },
  {
    name: "title",
    field: "title",
    label: "عنوان یادآور",
  },
  {
    name: "userCount",
    field: "userCount",
    label: "تعداد گیرندگان",
    render: (row: any) => (
      <span className="badge badge-primary">{row.userCount} نفر</span>
    ),
  },
  {
    name: "dueDate",
    field: "dueDate",
    label: "تاریخ ارسال",
    render: (row: any) => (
      <span className="text-sm">
        {new Date(row.dueDate).toLocaleDateString("fa-IR")}
      </span>
    ),
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
    render: (row: any) => (
      <span
        className={`badge ${
          row.status === "PENDING"
            ? "badge-warning"
            : row.status === "COMPLETED"
            ? "badge-success"
            : "badge-error"
        }`}
      >
        {row.status === "PENDING"
          ? "در انتظار"
          : row.status === "COMPLETED"
          ? "تکمیل شده"
          : "لغو شده"}
      </span>
    ),
  },
  {
    name: "actions",
    field: "actions",
    label: "عملیات",
    render: (row: any) => (
      <Link
        href={`/dashboard/reminders/grouped/${row.reminderNumber}`}
        className="btn btn-sm btn-primary"
      >
        مشاهده جزئیات
      </Link>
    ),
  },
];

// فیلترهای موجود
const filters: FilterOption[] = [
  {
    name: "status",
    label: "وضعیت",
    options: [
      { value: "all", label: "همه وضعیت‌ها" },
      { value: "PENDING", label: "در انتظار" },
      { value: "COMPLETED", label: "تکمیل شده" },
      { value: "CANCELLED", label: "لغو شده" },
    ],
  },
];

interface GroupedRemindersPageProps {
  isAdmin?: boolean;
}

export default function GroupedRemindersPage({
  isAdmin = false,
}: GroupedRemindersPageProps) {
  const { getGroupedReminders, loading, error } = useReminder();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">نمایش گروه‌بندی یادآورها</h1>
        <p className="text-gray-600">
          یادآورهای گروهی بر اساس شماره یادآور دسته‌بندی شده‌اند
        </p>
      </div>

      <DataTableWrapper
        title=""
        columns={groupedColumns}
        loading={loading}
        error={error}
        fetcher={getGroupedReminders}
        filterOptions={filters}
        dateFilterFields={[]}
        createUrl="/dashboard/reminders/create"
      />
    </div>
  );
}

// مسیر فایل: src/modules/reminders/data/table.tsx
"use client";
import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import { ReminderWithDetails } from "../types";

const renderEntityLink = (row: ReminderWithDetails) => {
  if (!row.entityType || !row.entityId)
    return <span className="text-gray-400">-</span>;
  const entityNameMap: Record<string, string> = {
    Request: "درخواست",
    Invoice: "فاکتور",
  };
  const name = entityNameMap[row.entityType] || row.entityType;
  const path = `/dashboard/${row.entityType.toLowerCase()}s/${row.entityId}`;
  return (
    <Link
      href={path}
      className="text-blue-600 hover:underline"
    >{`${name} #${row.entityId}`}</Link>
  );
};

export const columns: Column[] = [
  { name: "title", field: "title", label: "عنوان" },
  {
    name: "reminderNumber",
    field: "reminderNumber",
    label: "شماره یادآور",
    render: (row) => (
      <span className="font-mono text-sm text-gray-600">
        {row.reminderNumber || "-"}
      </span>
    ),
  },
  {
    name: "groupName",
    field: "groupName",
    label: "نام گروه",
    render: (row) => (
      <span className="text-sm">
        {row.groupName || <span className="text-gray-400">فردی</span>}
      </span>
    ),
  },
  {
    name: "workspaceUser",
    field: "workspaceUser.displayName",
    label: "کاربر",
    render: (row) =>
      row.workspaceUser?.displayName || row.workspaceUser?.phone || "نامشخص",
  },
  {
    name: "relatedTo",
    label: "مربوط به",
    render: (row) => renderEntityLink(row),
  },
  {
    name: "dueDate",
    field: "dueDate",
    label: "زمان ارسال",
    render: (row) => (
      <DateDisplay
        date={row.dueDate}
        customFormat="yyyy/MM/dd HH:mm"
        short={false}
        showTooltip={true}
      />
    ),
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "delete"]}
        row={row}
        onView={`/dashboard/reminders/${row.id}`}
        showLabels
      />
    ),
  },
];

// کارت نمایش یادآورها مشابه درخواست‌ها
export const listItemRender = (row: any) => (
  <div className="bg-white px-2 py-2 border-2 rounded-lg border-gray-400 hover:shadow-sm transition-shadow">
    <Link href={`/dashboard/reminders/${row.id}`}>
      <div className="flex justify-between items-center border-b-2 py-2">
        {row.status ? <StatusBadge status={row.status} /> : null}
        <span className="text-sm text-gray-500">
          <DIcon icon="fa-calendar" cdi={false} classCustom="ml-1" />
          <DateDisplay date={row.dueDate} />
        </span>
      </div>

      <h3 className="font-bold text-md my-2 text-gray-900">{row.title}</h3>
      <h3 className="text-gray-800 text-sm mt-1">
        {row.description || "بدون توضیحات"}
      </h3>
    </Link>
    <div className="flex justify-between py-2 mt-2 rounded-lg border-[1px] border-gray-300 text-gray-800 px-2">
      <p className="text-gray-900">
        {row.workspaceUser?.displayName ||
          row.workspaceUser?.user?.name ||
          "نامشخص"}
      </p>
      <a
        href={`tel:${row.workspaceUser?.user?.phone}`}
        className="text-gray-800 text-lg flex"
      >
        {row.workspaceUser?.user?.phone || "نامشخص"}
        <DIcon
          icon="fa-phone"
          cdi={false}
          classCustom="!mx-4 text-gray-800 text-lg"
        />
      </a>
    </div>

    <div className="flex items-center mt-4 border-t-2 pt-4 gap-2 text-gray-900">
      <Link href={`/dashboard/reminders/${row.id}`} className="btn btn-ghost">
        <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
        <span>مشاهده</span>
      </Link>
      <Link
        href={`/dashboard/reminders/${row.id}/edit`}
        className="btn btn-ghost"
      >
        <DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />
        <span>ویرایش</span>
      </Link>
      <button
        className="btn btn-ghost"
        onClick={async (e) => {
          e.preventDefault();
          try {
            await fetch(`/api/reminders/${row.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "X-Workspace-Id": (row.workspaceId || "").toString(),
              },
              body: JSON.stringify({ isActive: !row.isActive }),
            });
          } catch {}
        }}
      >
        <DIcon
          icon={row.isActive ? "fa-pause" : "fa-play"}
          cdi={false}
          classCustom="ml-2"
        />
        <span>{row.isActive ? "غیرفعال سازی" : "فعال سازی"}</span>
      </button>
    </div>
  </div>
);

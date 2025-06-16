// src/modules/received-devices/data/table.tsx

"use client";

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import { ReceivedDeviceWithRelations } from "../types";

export const columnsForAdmin: Column[] = [
  {
    name: "deviceInfo",
    field: "id",
    label: "دستگاه",
    render: (row) => (
      <div>
        <p className="font-semibold">{`${row.deviceType?.name} ${row.brand?.name}`}</p>
        <p className="text-xs text-gray-500">{row.model || "بدون مدل"}</p>
      </div>
    ),
  },
  {
    name: "user",
    field: "user",
    label: "مشتری",
    render: (row) => row.user?.name || row.user?.phone,
  },
  {
    name: "receivedDate",
    field: "receivedDate",
    label: "تاریخ تحویل",
    render: (row) => <DateDisplay date={row.receivedDate} />,
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت درخواست",
    render: (row) => <StatusBadge status={row.request?.status?.name} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/received-devices/${row.id}`}
        onEdit={`/dashboard/received-devices/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: ReceivedDeviceWithRelations) => (
  <Link href={`/dashboard/received-devices/${row.id}`}>
    {/* ... محتوای رندر کارت ... */}
  </Link>
);

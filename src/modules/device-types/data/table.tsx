// src/modules/device-types/data/table.tsx

"use client";

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import { DeviceTypeWithRelations } from "../types";

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام نوع دستگاه",
  },
  {
    name: "description",
    field: "description",
    label: "توضیحات",
  },
];

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام نوع دستگاه",
  },
  {
    name: "description",
    field: "description",
    label: "توضیحات",
    render: (row) => row.description || "-",
  },
  {
    name: "receivedDevicesCount",
    field: "_count.receivedDevices",
    label: "تعداد دستگاه‌ها",
    render: (row) => row._count?.receivedDevices || 0,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/device-types/${row.id}`}
        onEdit={`/dashboard/device-types/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: DeviceTypeWithRelations) => (
  <Link href={`/dashboard/device-types/${row.id}`}>
    <div className="bg-white rounded-lg p-4 border-[1px] border-gray-300 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{row.name}</h3>
        </div>
        <div className="flex gap-4 text-gray-500">
          <div>
            <DIcon icon="fa-mobile-alt" cdi={false} classCustom="ml-1" />
            {row._count?.receivedDevices || 0} دستگاه
          </div>
        </div>
      </div>
      {row.description && (
        <p className="text-gray-600 mt-2 text-sm">{row.description}</p>
      )}
    </div>
  </Link>
);

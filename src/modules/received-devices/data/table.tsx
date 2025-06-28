// src/modules/received-devices/data/table.tsx

"use client";

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

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

// export const listItemRender = (row: ReceivedDeviceWithRelations) => (
//   <Link href={`/dashboard/received-devices/${row.id}`}>
//     {/* ... محتوای رندر کارت ... */}
//   </Link>
// );

export const listItemRender = (row: any) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="flex">
          <h3 className="font-semibold text-md">
            {row.deviceType?.name || "نامشخص"}
          </h3>
          <div className="text-xs text-gray-500 mt-1 mx-1">
            {"( مدل : " + row.model + ") " || "(بدون مدل)"}
          </div>
        </div>
        {row.id && (
          <div>
            <p className="space-y-1 text-gray-500 text-sm mt-1">
              <div>
                <p className="font-semibold bg-slate-200 px-2 rounded-lg border-[1px]">{`${row.brand?.name}`}</p>
              </div>
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-between ">
        <a
          href={`tel:${row.user?.phone}`}
          className="text-primary text-sm flex flex-col "
        >
          <div className="rounded-lg bg-teal-100 border-[1px] border-teal-200  text-primary py-1 px-2 mb-1">
            {row.user?.phone || "بدون شماره"}
            <DIcon
              icon="fa-phone"
              cdi={false}
              classCustom="!mx-1 text-primary text-lg"
            />
          </div>
          {row.user?.name || "نامشخص"}
        </a>
      </div>
    </div>
    {row.labels && row.labels.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {row.labels.map((item) => (
          <span
            key={item.id}
            className={` p-2 rounded-lg py-1 border-[1px]`}
            style={{ borderColor: item.color, color: item.color }}
          >
            {" "}
            {item.name}
          </span>
        ))}
      </div>
    )}
    <div className="flex justify-end items-center mt-2">
      <div className="flex justify-end items-center mt-4 border-t-2 pt-4 w-full">
        <ActionsTable
          actions={["view", "edit", "delete"]}
          row={row}
          onView={`/dashboard/received-devices/${row.id}`}
          onEdit={`/dashboard/received-devices/${row.id}/update`}
          showLabels
          className="justify-between px-4 w-full "
        />
      </div>
    </div>
  </div>
);

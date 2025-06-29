"use client";

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import { ReceivedDeviceWithRelations } from "../types";

export const columnsForAdmin: Column[] = [
  {
    name: "deviceInfo",
    field: "id",
    label: "دستگاه",
    render: (row: ReceivedDeviceWithRelations) => (
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
    render: (row: ReceivedDeviceWithRelations) =>
      row.user?.name || row.user?.phone,
  },
  {
    name: "receivedDate",
    field: "receivedDate",
    label: "تاریخ تحویل",
    render: (row: ReceivedDeviceWithRelations) => (
      <DateDisplay date={row.receivedDate} />
    ),
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
    render: (row: ReceivedDeviceWithRelations) => {
      // ▼▼▼ تغییر نهایی برای رفع خطا در اینجا اعمال شده است ▼▼▼
      const statusText = row.request?.status?.name || "پذیرش شده";
      return <StatusBadge status={statusText} />;
    },
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: ReceivedDeviceWithRelations) => (
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

export const listItemRender = (row: ReceivedDeviceWithRelations) => {
  const statusText = row.request?.status?.name || "پذیرش شده";

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* بخش هدر کارت */}
      <StatusBadge status={statusText} className="m-2" />
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 text-primary-600 rounded-md p-2">
            <DIcon icon="fa-mobile-alt" cdi={false} classCustom="h-5 w-5" />
          </div>
          <div className="place-items-start flex flex-col">
            <h3 className="flex flex-row font-bold text-gray-800 text-lg">
              {row.deviceType?.name || "دستگاه نامشخص"}{" "}
              <h2 className="text-sm mt-1 mx-2 ">
                {" "}
                {row.model
                  ? ` ( مدل : ${row.model}  )`
                  : " ( مدل : نامشخص )"}{" "}
              </h2>
            </h3>
            <div className="justify-self-start font-bold text-sm px-2 py-0 mt-1 text-teal-700 inline-block !bg-slate-100 rounded-lg ">
              {row.brand?.name}
            </div>
          </div>
        </div>
      </div>

      {/* بخش اصلی کارت */}
      <div className="p-4 flex-grow">
        {/* اطلاعات مشتری و شماره سریال */}
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <DIcon
              icon="fa-user"
              cdi={false}
              classCustom="w-4 ml-2 text-gray-400"
            />
            <span className="font-medium text-gray-600">مشتری:</span>
            <span className="text-gray-800 font-semibold mr-2">
              {row.user?.name || row.user?.phone || "نامشخص"}
            </span>
          </div>
          {row.serialNumber && (
            <div className="flex items-center text-sm">
              <DIcon
                icon="fa-fingerprint"
                cdi={false}
                classCustom="w-4 ml-2 text-gray-400"
              />
              <span className="font-medium text-gray-600">شماره سریال:</span>
              <span className="text-gray-800 font-semibold mr-2 ltr">
                {row.serialNumber}
              </span>
            </div>
          )}
        </div>

        {/* شرح مشکل */}
        <div className="mt-4 pt-4 border-t border-dashed">
          <h4 className="font-semibold text-gray-700 mb-2">شرح مشکل مشتری:</h4>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {row.problemDescription || "توضیحی ثبت نشده است."}
          </p>
        </div>
      </div>

      {/* بخش فوتر کارت */}
      <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center text-sm text-gray-500">
          <DIcon icon="fa-calendar-check" cdi={false} classCustom="w-4 ml-2" />
          <span className="font-medium">تاریخ پذیرش:</span>
          <span className="mr-1">
            <DateDisplay date={row.receivedDate} />
          </span>
        </div>
        <ActionsTable
          actions={["view", "edit", "delete"]}
          row={row}
          onView={`/dashboard/received-devices/${row.id}`}
          onEdit={`/dashboard/received-devices/${row.id}/update`}
        />
      </div>
    </div>
  );
};

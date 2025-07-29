// مسیر فایل: src/modules/workspace-users/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

// الگوبرداری دقیق از ساختار ستون‌ها در ماژول brands
export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "user.name",
    label: "نام عضو",
    // رندر نیز باید از مسیر صحیح تو در تو داده را بخواند
    render: (row: any) => row.displayName || row.user?.name || "-",
  },
  {
    name: "phone",
    field: "user.phone",
    label: "شماره تلفن",
    render: (row: any) => row.user?.phone || "-",
  },
  {
    name: "role",
    field: "role.name",
    label: "نقش",
    render: (row: any) => row.role?.name || "-",
  },
  {
    name: "labels",
    label: "برچسپ ها",
    render: (row) => (
      <span>
        {row.labels && row.labels.length > 0 ? (
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
        ) : (
          <p>-</p>
        )}
      </span>
    ),
  },
  {
    name: "userGroups",
    label: "گروه‌ها",
    render: (row: any) =>
      row.userGroups?.map((item: any) => item.name).join(", ") || "-",
  },
  // ===== پایان اصلاحیه کلیدی =====
  {
    name: "createdAt",
    field: "createdAt",
    label: "تاریخ عضویت",
    // به جای کامپوننت DateDisplay، از متد استاندارد جاوااسکریپت استفاده می‌کنیم
    render: (row: any) => new Date(row.createdAt).toLocaleDateString("fa-IR"),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        row={row}
        actions={["edit", "delete"]}
        onEdit={`/dashboard/workspace-users/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "user.name",
    label: "نام عضو",
    // رندر نیز باید از مسیر صحیح تو در تو داده را بخواند
    render: (row: any) => row.displayName || row.user?.name || "-",
  },
  {
    name: "phone",
    field: "user.phone",
    label: "شماره تلفن",
    render: (row: any) => row.user?.phone || "-",
  },
  {
    name: "role",
    field: "role.name",
    label: "نقش",
    render: (row: any) => row.role?.name || "-",
  },
];

export const listItemRender = (row: any) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold text-md">
          {row.displayName || row.user?.name || "نامشخص"}
        </h3>

        {row.address && (
          <p className="text-gray-500 text-sm mt-1">
            <DIcon icon="fa-location-dot" cdi={false} classCustom="ml-1" />
            {row.address}
          </p>
        )}
      </div>
      <div className="flex justify-between py-1 rounded-lg border-[1px] border-primary text-primary px-2">
        <a
          href={`tel:${row.user?.phone}`}
          className="text-primary text-lg flex"
        >
          {row.phone || "نامشخص"}
          <DIcon
            icon="fa-phone"
            cdi={false}
            classCustom="!mx-1 text-primary text-lg"
          />
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
          onView={`/dashboard/workspace-users/${row.id}`}
          onEdit={`/dashboard/workspace-users/${row.id}/update`}
          showLabels
          className="justify-between px-4 w-full "
        />
      </div>
    </div>
  </div>
);

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
export const columnsForAdmin: Column[] = [
  {
    name: "customer",
    label: "مشتری",
    // مسیر دسترسی به نام مشتری اکنون از طریق workspaceUser است
    render: (row: any) =>
      row.workspaceUser?.displayName || row.workspaceUser?.name || "-",
  },
  {
    name: "assignedTo",
    label: "تخصیص به",
    render: (row: any) => row.assignedTo?.workspaceUser?.name || "تخصیص نیافته",
  },
  {
    name: "service",
    field: "serviceType.name",
    label: "نوع خدمات",
    render: (row) => row.serviceType?.name || "-", // اضافه کردن optional chaining برای جلوگیری از خطا
  },
  {
    name: "status",
    field: "status.name",
    label: "وضعیت",
    render: (row) =>
      row.status ? <StatusBadge status={row.status.name} /> : "-",
  },
  {
    name: "date",
    field: "createdAt",
    label: "تاریخ",
    render: (row) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/requests/${row.id}`}
        showLabels
      />
    ),
  },
];

export const columnsForUser: Column[] = [
  {
    name: "service",
    field: "serviceType.name",
    label: "نوع خدمات",
    render: (row) => row.serviceType?.name,
  },
  {
    name: "status",
    field: "status.name",
    label: "وضعیت",
    render: (row) => <StatusBadge status={row.status.name} />,
  },
  {
    name: "date",
    field: "createdAt",
    label: "تاریخ",
    render: (row) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view"]}
        row={row}
        onView={`/panel/requests/${row.id}`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <div className="bg-white px-2 py-2 border-2 rounded-lg border-gray-400 hover:shadow-sm transition-shadow">
    <Link href={`/dashboard/requests/${row.id}`}>
      <div className="flex justify-between items-center border-b-2 py-2">
        {row.status ? <StatusBadge status={row.status.name} /> : null}
        <span className="text-sm text-gray-500">
          <DIcon icon="fa-calendar" cdi={false} classCustom="ml-1" />
          <DateDisplay date={row.createdAt} />
        </span>
      </div>

      <h3 className="font-bold text-md my-2">{row.serviceType?.name}</h3>
      <h3 className="text-gray-700 text-sm mt-1">{row.description}</h3>
    </Link>
    <div className="flex justify-between py-2 mt-2 rounded-lg border-[1px] border-primary text-primary px-2">
      {/* مسیر دسترسی به نام و تلفن مشتری اصلاح شد */}
      <p className="text-gray-900">
        {row.workspaceUser?.user?.name || "نامشخص"}
      </p>
      <a
        href={`tel:${row.workspaceUser?.user?.phone}`}
        className="text-primary text-lg flex"
      >
        {row.workspaceUser?.user?.phone || "نامشخص"}
        <DIcon
          icon="fa-phone"
          cdi={false}
          classCustom="!mx-4 text-primary text-lg"
        />
      </a>
    </div>

    <div className="flex justify-between items-center my-2 w-full">
      <div className="flex justify-end items-center mt-1 border-t-2 pt-4 w-full">
        <ActionsTable
          actions={["view", "edit", "delete"]}
          row={row}
          className="justify-between px-4 w-full "
          onView={`/dashboard/requests/${row.id}`}
          showLabels
        />
      </div>
    </div>
  </div>
);

export const listItemRenderUser = (row: any) => (
  <Link href={`/panel/requests/${row.id}`}>
    <div className="bg-white px-4 py-3 border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
      {/* بخش هدر کارت */}
      <div className="flex justify-between items-center border-b pb-2">
        {row.status ? (
          <StatusBadge status={row.status.name} />
        ) : (
          <span className="text-sm text-gray-500">بدون وضعیت</span>
        )}
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <DIcon icon="fa-calendar" cdi={false} />
          <DateDisplay date={row.createdAt} />
        </span>
      </div>

      {/* بخش اصلی کارت */}
      <div className="py-2">
        <h3 className="font-semibold text-md my-1">
          {/* اضافه کردن optional chaining برای جلوگیری از خطا */}
          {row.serviceType?.name || "خدمات عمومی"}
        </h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {row.description}
        </p>
      </div>

      {/* بخش اطلاعات کارشناس */}
      {row.workspaceUser && (
        <div className="text-sm text-gray-800 border-t pt-2 mt-1 flex items-center">
          <DIcon
            icon="fa-user-helmet-safety"
            cdi={false}
            classCustom="ml-2 text-gray-500"
          />
          <span>مشتری: </span>
          <span className="font-medium mr-1">
            {row.workspaceUser?.displayName ||
              row.workspaceUser?.name ||
              row.workspaceUser?.phone ||
              row.workspaceUser?.user?.name ||
              "نامشخص"}
          </span>
        </div>
      )}

      {/* بخش عملیات */}
      <div className="flex justify-end items-center mt-2 border-t-2 pt-3 w-full">
        <ActionsTable
          // اکشن‌ها برای کاربر نهایی محدودتر است
          actions={["view"]}
          row={row}
          className="justify-between w-full"
          onView={`/panel/requests/${row.id}`}
          showLabels
        />
      </div>
    </div>
  </Link>
);

// export const listItemRenderUser = (row: any) => (
//   <Link href={`/panel/requests/${row.id}`}>
//     <div className="bg-white px-2 py-2 border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-center border-b-2 py-2">
//         <StatusBadge status={row.status.name} />
//         <span className="text-sm text-gray-500">
//           <DIcon icon="fa-calendar" cdi={false} classCustom="ml-1" />
//           <DateDisplay date={row.createdAt} />
//         </span>
//       </div>

//       <h3 className="font-semibold text-md my-2">{row.serviceType.name}</h3>
//       <h3 className="text-gray-700 text-sm mt-1">{row.description}</h3>
//       <div className="flex justify-between items-center my-2 w-full">
//         <div className="flex justify-end items-center mt-2 border-t-2 pt-4 w-full">
//           <ActionsTable
//             actions={["view", "edit", "delete"]}
//             row={row}
//             className="justify-between px-4 w-full "
//             onView={`/panel/requests/${row.id}`}
//             showLabels
//           />
//         </div>
//       </div>
//     </div>
//   </Link>
// );

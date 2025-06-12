import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForAdmin: Column[] = [
  {
    name: "customer",
    field: "user.name",
    label: "نام مخاطب",
    render: (row) => row.user.name || "نامشخص",
  },
  {
    name: "phone",
    field: "user.phone",
    label: "شماره تماس",
    render: (row) => row.user.phone,
  },
  {
    name: "service",
    field: "serviceType.name",
    label: "نوع خدمات",
    render: (row) => row.serviceType.name,
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
    render: (row) => row.serviceType.name,
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
  <div className="bg-white px-2 py-2 border-2 rounded-lg border-[1px] border-gray-400 hover:shadow-sm transition-shadow">
    <Link href={`/dashboard/requests/${row.id}`}>
      <div className="flex justify-between items-center border-b-2 py-2">
        <StatusBadge status={row.status.name} />
        <span className="text-sm text-gray-500">
          <DIcon icon="fa-calendar" cdi={false} classCustom="ml-1" />
          <DateDisplay date={row.createdAt} />
        </span>
      </div>

      <h3 className="font-bold text-md my-2">{row.serviceType.name}</h3>
      <h3 className="text-gray-700 text-sm mt-1">{row.description}</h3>
    </Link>
    <div className="flex justify-between py-2 mt-2 rounded-lg border-[1px] border-primary text-primary px-2">
      <p className="text-gray-900">{row.user?.name || "نامشخص"}</p>
      <a href={`tel:${row.user?.phone}`} className="text-primary text-lg flex">
        {row.user?.phone || "نامشخص"}
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
    <div className="bg-white px-2 py-2 border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center border-b-2 py-2">
        <StatusBadge status={row.status.name} />
        <span className="text-sm text-gray-500">
          <DIcon icon="fa-calendar" cdi={false} classCustom="ml-1" />
          <DateDisplay date={row.createdAt} />
        </span>
      </div>

      <h3 className="font-semibold text-md my-2">{row.serviceType.name}</h3>
      <h3 className="text-gray-700 text-sm mt-1">{row.description}</h3>
      <div className="flex justify-between items-center my-2 w-full">
        <div className="flex justify-end items-center mt-2 border-t-2 pt-4 w-full">
          <ActionsTable
            actions={["view", "edit", "delete"]}
            row={row}
            className="justify-between px-4 w-full "
            onView={`/panel/requests/${row.id}`}
            showLabels
          />
        </div>
      </div>
    </div>
  </Link>
);

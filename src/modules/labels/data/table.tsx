import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام",
    render: (row) => (
      <span
        className={` p-2 rounded-lg py-1 border-[1px]`}
        style={{ borderColor: row.color, color: row.color }}
      >
        {" "}
        {row.name}
      </span>
    ),
  },
];

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام برچسب",
  },
  {
    name: "color",
    field: "color",
    label: "رنگ",
    render: (row) => (
      <span
        className={` p-2 rounded-lg py-1 border-[1px]`}
        style={{ borderColor: row.color, color: row.color }}
      >
        {" "}
        {row.name}
      </span>
    ),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/labels/${row.id}`}
        onEdit={`/dashboard/labels/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <Link href={`/dashboard/labels/${row.id}`}>
    <div
      className={`bg-white rounded-lg flex hover:shadow-sm transition-shadow`}
    >
      <div
        className={`w-8 h-auto rounded-r-lg`}
        style={{ backgroundColor: row.color }}
      ></div>
      <div className="p-4 flex justify-between w-full">
        <h3 className="text-gray-700 text-md">{row.name || "نامشخص"}</h3>
        <span>
          <DIcon icon="fa-user" cdi={false} />
          <span>{row._count.users}</span>
        </span>
      </div>
    </div>
  </Link>
);

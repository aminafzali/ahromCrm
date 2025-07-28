import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام گروه",
  },
];

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام گروه",
  },
  {
    name: "description",
    field: "description",
    label: "توضیحات",
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/user-groups/${row.id}`}
        onEdit={`/dashboard/user-groups/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <Link href={`/dashboard/user-groups/${row.id}`}>
    <div className="bg-white rounded-lg p-4  flex justify-between items-center hover:shadow-sm transition-shadow px-2 border-[1px] border-gray-300">
      <div>
        <h3 className="text-gray-700 text-md">{row.name || "نامشخص"}</h3>
        <h3 className="text-gray-400 text-sm">{row.description || "نامشخص"}</h3>
      </div>

      <div className="my-auto">
        <DIcon icon="fa-user" />
        {/* todo:t3 این بخش باید بعدا اصلاح شود */}
        {/* <span>{row._count.workspaceUsers}</span> */}
      </div>
    </div>
  </Link>
);

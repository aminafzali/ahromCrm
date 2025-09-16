// مسیر فایل: src/modules/teams/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columns: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام تیم",
  },
  {
    name: "membersCount",
    label: "تعداد اعضا",
    render: (row) => row._count?.members || 0,
  },
  {
    name: "projectsCount",
    label: "پروژه‌ها",
    render: (row) => row._count?.assignedProjects || 0,
  },
  {
    name: "tasksCount",
    label: "وظایف",
    render: (row) => row._count?.assignedTasks || 0,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        row={row}
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/teams/${row.id}`}
        onEdit={`/dashboard/teams/${row.id}/update`}
      />
    ),
  },
];


export const columnsForSelect: Column[] = [
    {
      name: "name",
      field: "name",
      label: "نام تیم",
    },
    {
        name: "membersCount",
        label: "تعداد اعضا",
        render: (row) => row._count?.members || 0,
      },
  ];
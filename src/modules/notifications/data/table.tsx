import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columns: Column[] = [
  {
    name: "title",
    field: "title",
    label: "عنوان",
  },
  {
    name: "message",
    field: "message",
    label: "پیام",
  },
  {
    name: "isRead",
    field: "isRead",
    label: "وضعیت",
    render: (row) => (
      <span
        className={`py-2 px-4 rounded-lg bg-${
          row.isRead ? "success" : "warning"
        }`}
      >
        {row.isRead ? "خوانده شده" : "خوانده نشده"}
      </span>
    ),
  },
  {
    name: "date",
    field: "createdAt",
    label: "تاریخ",
    render: (row) => <DateDisplay date={row.createdAt} />,
  },
];

export const columnsForAdmin: Column[] = [
  {
    name: "user",
    label: "کاربر",
    field: "workspaceUser.user.name",
    render: (row: any) =>
      row.workspaceUser?.displayName || row.workspaceUser?.user?.name || "-",
  },
  {
    name: "title",
    field: "title",
    label: "عنوان",
  },
  {
    name: "message",
    field: "message",
    label: "پیام",
    render: (row) => <p className="line-clamp-2">{row.message}</p>,
  },
  {
    name: "isRead",
    label: "وضعیت",
    render: (row) =>
      row.isRead ? (
        <span className="text-green-500 flex items-center gap-1">
          <DIcon icon="fa-check-circle" /> خوانده شده
        </span>
      ) : (
        <span className="text-yellow-500 flex items-center gap-1">
          <DIcon icon="fa-clock" /> خوانده نشده
        </span>
      ),
  },
  {
    name: "createdAt",
    field: "createdAt",
    label: "تاریخ ارسال",
    render: (row: any) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["delete"]} // معمولاً نوتیفیکیشن‌ها فقط حذف می‌شوند
        row={row}
        showLabels
      />
    ),
  },
];



export const listItemRender = (row: any) => (
  <Link
    href={row.request ? `/panel/requests/${row.request.id}` : ""}
    className="flex my-1"
  >
    {/* <div
      className="px-1 rounded-full bg-white mx-1"
      style={{ height: "min-content" }}
    >
      <DIcon icon="fa-bell" classCustom="!text-lg !m-0 !p-0" />
    </div> */}
    <div className="w-full bg-white rounded-xl p-4">
      <div className="flex justify-between">
        <h3 className="text-sm text-primary flex text-center">
          <div
            className="px-1 rounded-full bg-white mx-1"
            style={{ height: "min-content" }}
          >
            <DIcon icon="fa-bell" classCustom="!text-lg !m-0 !p-0" />
          </div>
          {row.title}
        </h3>

        <DateDisplay
          date={row.createdAt}
          size="xs"
          className=" !text-gray-400"
        />
      </div>

      <p
        className="text-sm text-gray-500 border-t-2 border-t-gray-300 pt-4 my-2"
        dangerouslySetInnerHTML={{
          __html: row.message.replace(/\n/g, "<br />"),
        }}
      ></p>
    </div>
  </Link>
);

export const listItemRender2 = (row: any) => (
  <div className="flex my-1">
    <div
      className="px-2 rounded-full bg-white mx-1"
      style={{ height: "min-content" }}
    >
      <DIcon icon="fa-bell" classCustom="!text-lg !m-0 !p-0" />
    </div>
    <div className="w-full bg-white rounded-xl p-4">
      <div className="flex justify-between">
        <h3 className="text-sm text-primary ">{row.title}</h3>

        <DateDisplay
          date={row.createdAt}
          size="xs"
          className=" !text-gray-400"
        />
      </div>

      <p
        className="text-sm text-gray-500 border-t-2 border-t-gray-300 pt-4 my-2"
        dangerouslySetInnerHTML={{
          __html: row.message.replace(/\n/g, "<br />"),
        }}
      ></p>
    </div>
  </div>
);

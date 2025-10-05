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
    name: "workspaceUser",
    label: "کاربر",
    field: "workspaceUser",
    render: (row: any) =>
      row.workspaceUser?.displayName ||
      row.workspaceUser?.name ||
      row.workspaceUser?.user?.name ||
      "-",
  },
  {
    name: "title",
    field: "title",
    label: "عنوان",
  },
  {
    name: "notificationNumber",
    field: "notificationNumber",
    label: "شماره اعلان",
    render: (row) => (
      <span className="font-mono text-sm text-gray-600">
        {row.notificationNumber || "-"}
      </span>
    ),
  },
  {
    name: "groupName",
    field: "groupName",
    label: "نام گروه",
    render: (row) => (
      <span className="text-sm">
        {row.groupName || <span className="text-gray-400">فردی</span>}
      </span>
    ),
  },
  {
    name: "message",
    field: "message",
    label: "پیام",
    render: (row) => <p className="line-clamp-2">{row.message}</p>,
  },
  // {
  //   name: "isRead",
  //   label: "وضعیت",
  //   render: (row) =>
  //     row.isRead ? (
  //       <span className="text-green-500 flex items-center gap-1">
  //         <DIcon icon="fa-check-circle" /> خوانده شده
  //       </span>
  //     ) : (
  //       <span className="text-yellow-500 flex items-center gap-1">
  //         <DIcon icon="fa-clock" /> خوانده نشده
  //       </span>
  //     ),
  // },
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
        actions={["view", "delete"]} // معمولاً نوتیفیکیشن‌ها فقط حذف می‌شوند
        row={row}
        onView={`/dashboard/notifications/${row.id}`}
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
  <div className="bg-white px-2 py-2 border-2 rounded-lg border-gray-400 hover:shadow-sm transition-shadow">
    <Link href={`/dashboard/notifications/${row.id}`}>
      <div className="flex justify-between items-center border-b-2 py-2">
        <span
          className={`badge ${
            row.status === "PENDING"
              ? "badge-warning"
              : row.status === "SENT"
              ? "badge-success"
              : "badge-error"
          }`}
        >
          {row.status === "PENDING"
            ? "در انتظار"
            : row.status === "SENT"
            ? "ارسال شده"
            : "ناموفق"}
        </span>
        <span className="text-sm text-gray-500">
          <DIcon icon="fa-bell" cdi={false} classCustom="ml-1" />
          <DateDisplay date={row.createdAt} />
        </span>
      </div>

      <h3 className="font-bold text-md my-2 text-gray-900">{row.title}</h3>
      <h3 className="text-gray-800 text-sm mt-1">
        {row.message || "بدون پیام"}
      </h3>
    </Link>
    <div className="flex justify-between py-2 mt-2 rounded-lg border-[1px] border-gray-300 text-gray-800 px-2">
      <p className="text-gray-900">
        {row.workspaceUser?.displayName ||
          row.workspaceUser?.user?.name ||
          "نامشخص"}
      </p>
      <a
        href={`tel:${row.workspaceUser?.user?.phone}`}
        className="text-gray-800 text-lg flex"
      >
        {row.workspaceUser?.user?.phone || "نامشخص"}
        <DIcon
          icon="fa-phone"
          cdi={false}
          classCustom="!mx-4 text-gray-800 text-lg"
        />
      </a>
    </div>

    <div className="flex items-center mt-4 border-t-2 pt-4 gap-2 text-gray-900">
      <Link
        href={`/dashboard/notifications/${row.id}`}
        className="btn btn-ghost"
      >
        <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
        <span>مشاهده</span>
      </Link>
      <Link
        href={`/dashboard/notifications/${row.id}/edit`}
        className="btn btn-ghost"
      >
        <DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />
        <span>ویرایش</span>
      </Link>
    </div>
  </div>
);

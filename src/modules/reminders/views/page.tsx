import DIcon from "@/@Client/Components/common/DIcon";
import { TabsWrapper } from "@/@Client/Components/wrappers";
import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { FilterOption } from "@/@Client/types";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { columns, listItemRender } from "../data/table";
import { useReminder } from "../hooks/useReminder";

export default function RemindersModuleView() {
  const { getAll, loading, error, getGroupedReminders } = useReminder();
  const { getAll: getAllUserGroups } = useUserGroup();
  const { getAll: getAllLabels } = useLabel();
  const { getAll: getAllUsers } = useWorkspaceUser();

  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const [ug, lb, us] = await Promise.all([
        getAllUserGroups({ page: 1, limit: 1000 }).then((r) => r.data),
        getAllLabels({ page: 1, limit: 1000 }).then((r) => r.data),
        getAllUsers({ page: 1, limit: 1000 }).then((r) => r.data),
      ]);
      setUserGroups(ug || []);
      setLabels(lb || []);
      setUsers(us || []);
    })();
  }, []);

  // ساخت گزینه‌های فیلتر برای DataTableWrapper2
  const filters: FilterOption[] = useMemo(() => {
    const newFilters: FilterOption[] = [];

    // فیلتر کاربر
    if (users && users.length > 0) {
      newFilters.push({
        name: "workspaceUserId",
        label: "کاربر",
        options: [
          { value: "all", label: "همه کاربران" },
          ...users.map((u) => ({
            value: u.id,
            label: u.displayName || u.user?.name || u.user?.phone,
          })),
        ],
      });
    }

    // فیلتر وضعیت
    newFilters.push({
      name: "status_in",
      label: "وضعیت",
      options: [
        { value: "all", label: "همه وضعیت‌ها" },
        { value: "PENDING", label: "در انتظار" },
        { value: "COMPLETED", label: "تکمیل شده" },
        { value: "CANCELLED", label: "لغو شده" },
      ],
    });

    // فیلتر شماره یادآور (فقط برای نمایش - جستجو از طریق search انجام می‌شود)
    // این فیلتر در DataTableWrapper2 به صورت خودکار از search استفاده می‌کند

    if (userGroups && userGroups.length > 0) {
      newFilters.push({
        name: "groupIds",
        label: "گروه کاربری",
        options: [
          { value: "all", label: "همه گروه‌ها" },
          ...userGroups.map((g) => ({ value: g.id, label: g.name })),
        ],
      });
    }

    if (labels && labels.length > 0) {
      newFilters.push({
        name: "labelIds",
        label: "برچسب کاربری",
        options: [
          { value: "all", label: "همه برچسب‌ها" },
          ...labels.map((l) => ({ value: l.id, label: l.name })),
        ],
      });
    }

    return newFilters;
  }, [users, userGroups, labels]);

  // Generate refresh key based on filters
  const refreshKey = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  // فیلتر تاریخ‌ها - مطابق الگوی فاکتور
  const dateFilters = [
    { name: "dueDate", label: "تاریخ و زمان ارسال" },
    { name: "createdAt", label: "تاریخ ایجاد" },
  ];

  // محتوای تب همه یادآورها
  const individualContent = useMemo(
    () => (
      <DataTableWrapper
        key={`individual-tab-${refreshKey}`}
        title="همه یادآورها"
        columns={columns}
        loading={loading}
        error={error}
        fetcher={getAll}
        listItemRender={listItemRender}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        createUrl="/dashboard/reminders/create"
      />
    ),
    [
      loading,
      error,
      getAll,
      filters,
      dateFilters,
      columns,
      listItemRender,
      refreshKey,
    ]
  );

  // محتوای تب گروه‌بندی شده - جدول مخصوص گروه‌بندی
  const groupedViewContent = useMemo(() => {
    // ستون‌های مخصوص نمایش گروه‌بندی شده
    const groupedColumns = [
      {
        name: "reminderNumber",
        field: "reminderNumber",
        label: "شماره یادآور",
        render: (row: any) => (
          <span className="font-mono text-sm font-bold text-blue-600">
            {row.reminderNumber || "بدون شماره"}
          </span>
        ),
      },
      {
        name: "groupName",
        field: "groupName",
        label: "نام گروه",
        render: (row: any) => (
          <span className="font-medium text-gray-800">
            {row.groupName || "بدون نام گروه"}
          </span>
        ),
      },
      {
        name: "title",
        field: "title",
        label: "عنوان یادآور",
      },
      {
        name: "userCount",
        field: "userCount",
        label: "تعداد گیرندگان",
        render: (row: any) => (
          <span className="badge badge-primary">{row.userCount || 0} نفر</span>
        ),
      },
      {
        name: "dueDate",
        field: "dueDate",
        label: "تاریخ و زمان ارسال",
        render: (row: any) => (
          <div className="text-sm flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
            <span>{new Date(row.dueDate).toLocaleDateString("fa-IR")}</span>
            <span className="hidden sm:inline">-</span>
            <span>{new Date(row.dueDate).toLocaleTimeString("fa-IR")}</span>
          </div>
        ),
      },
      {
        name: "status",
        field: "status",
        label: "وضعیت",
        render: (row: any) => (
          <span
            className={`badge ${
              row.status === "PENDING"
                ? "badge-warning"
                : row.status === "COMPLETED"
                ? "badge-success"
                : "badge-error"
            }`}
          >
            {row.status === "PENDING"
              ? "در انتظار"
              : row.status === "COMPLETED"
              ? "تکمیل شده"
              : "لغو شده"}
          </span>
        ),
      },
      {
        name: "actions",
        field: "actions",
        label: "",
        render: (row: any) => (
          <div className="flex items-center gap-2 border-top-2 pt-2 border-t-2">
            <Link
              href={`/dashboard/reminders/grouped/${row.reminderNumber}`}
              className="btn btn-ghost btn-sm text-gray-900"
            >
              <DIcon icon="fa-eye" cdi={false} classCustom="ml-1" />
              <span>مشاهده</span>
            </Link>
          </div>
        ),
      },
    ];

    return (
      <DataTableWrapper
        key={`grouped-tab-${refreshKey}`}
        title="یادآورهای گروه‌بندی شده"
        columns={groupedColumns}
        loading={loading}
        error={error}
        fetcher={getGroupedReminders}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        createUrl="/dashboard/reminders/create"
        // extraFilter حذف شد چون getGroupedReminders خودش گروه‌بندی می‌کند
      />
    );
  }, [loading, error, getGroupedReminders, filters, dateFilters, refreshKey]);

  const tabs = useMemo(
    () => [
      {
        id: "grouped-view",
        label: "گروه‌بندی",
        content: groupedViewContent,
      },
      { id: "individual", label: "همه", content: individualContent },
    ],
    [individualContent, groupedViewContent]
  );

  return (
    <div>
      <TabsWrapper tabs={tabs} />
    </div>
  );
}

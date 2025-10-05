import DIcon from "@/@Client/Components/common/DIcon";
import { TabsWrapper } from "@/@Client/Components/wrappers";
import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { FilterOption } from "@/@Client/types";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { columnsForAdmin, listItemRender2 } from "../data/table";
import { useNotification } from "../hooks/useNotification";

export default function NotificationsModuleView() {
  const { getAll, loading, error, getGroupedNotifications } = useNotification();
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
        { value: "SENT", label: "ارسال شده" },
        { value: "FAILED", label: "ناموفق" },
      ],
    });

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
  const dateFilters = [{ name: "createdAt", label: "تاریخ ایجاد" }];

  // محتوای تب همه اعلان‌ها
  const individualContent = useMemo(
    () => (
      <DataTableWrapper
        key={`individual-tab-${refreshKey}`}
        title="همه اعلان‌ها"
        columns={columnsForAdmin}
        loading={loading}
        error={error}
        fetcher={getAll}
        listItemRender={listItemRender2}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        createUrl="/dashboard/notifications/create"
      />
    ),
    [
      loading,
      error,
      getAll,
      filters,
      dateFilters,
      columnsForAdmin,
      listItemRender2,
      refreshKey,
    ]
  );

  // محتوای تب گروه‌بندی شده - جدول مخصوص گروه‌بندی
  const groupedViewContent = useMemo(() => {
    // ستون‌های مخصوص نمایش گروه‌بندی شده
    const groupedColumns = [
      {
        name: "notificationNumber",
        field: "notificationNumber",
        label: "شماره اعلان",
        render: (row: any) => (
          <span className="font-mono text-sm font-bold text-blue-600">
            {row.notificationNumber || "بدون شماره"}
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
        label: "عنوان اعلان",
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
        name: "createdAt",
        field: "createdAt",
        label: "تاریخ و زمان ارسال",
        render: (row: any) => (
          <div className="text-sm flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
            <span>{new Date(row.createdAt).toLocaleDateString("fa-IR")}</span>
            <span className="hidden sm:inline">-</span>
            <span>{new Date(row.createdAt).toLocaleTimeString("fa-IR")}</span>
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
        ),
      },
      {
        name: "actions",
        field: "actions",
        label: "",
        render: (row: any) => (
          <div className="flex items-center gap-2 border-t-2 pt-2">
            <Link
              href={`/dashboard/notifications/grouped/${row.notificationNumber}`}
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
        title="اعلان‌های گروه‌بندی شده"
        columns={groupedColumns}
        loading={loading}
        error={error}
        fetcher={getGroupedNotifications}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        createUrl="/dashboard/notifications/create"
        // extraFilter حذف شد چون getGroupedNotifications خودش گروه‌بندی می‌کند
      />
    );
  }, [
    loading,
    error,
    getGroupedNotifications,
    filters,
    dateFilters,
    refreshKey,
  ]);

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

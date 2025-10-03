import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { FilterOption } from "@/@Client/types";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { useEffect, useState } from "react";
import { columns } from "../data/table";
import { useReminder } from "../hooks/useReminder";

export default function RemindersModuleView() {
  const { getAll, loading, error } = useReminder();
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
  const filters: FilterOption[] = [];

  // فیلتر کاربر
  if (users.length > 0) {
    filters.push({
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
  filters.push({
    name: "status",
    label: "وضعیت",
    options: [
      { value: "all", label: "همه وضعیت‌ها" },
      { value: "PENDING", label: "در انتظار" },
      { value: "COMPLETED", label: "تکمیل شده" },
      { value: "CANCELLED", label: "لغو شده" },
    ],
  });

  if (userGroups.length > 0) {
    filters.push({
      name: "groupIds",
      label: "گروه‌ها",
      options: [
        { value: "all", label: "همه گروه‌ها" },
        ...userGroups.map((g) => ({ value: g.id, label: g.name })),
      ],
    });
  }

  if (labels.length > 0) {
    filters.push({
      name: "labelIds",
      label: "برچسب‌ها",
      options: [
        { value: "all", label: "همه برچسب‌ها" },
        ...labels.map((l) => ({ value: l.id, label: l.name })),
      ],
    });
  }

  // فیلتر تاریخ‌ها - مطابق الگوی فاکتور
  const dateFilters = [
    { name: "dueDate", label: "تاریخ سررسید" },
    { name: "createdAt", label: "تاریخ ایجاد" },
  ];

  return (
    <div>
      <DataTableWrapper
        title="مدیریت یادآورها"
        columns={columns}
        loading={loading}
        error={error}
        fetcher={getAll}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        createUrl="/dashboard/reminders/create"
      />
    </div>
  );
}

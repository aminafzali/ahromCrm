// مسیر فایل: src/modules/reminders/views/page.tsx
"use client";
import Loading from "@/@Client/Components/common/Loading";
import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import { FilterOption } from "@/@Client/types";
import { useUser } from "@/modules/users/hooks/useUser";
import { UserWithRelations } from "@/modules/users/types";
import { ReminderStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import { columns } from "../data/table";
import { useReminder } from "../hooks/useReminder";
import { ReminderWithDetails } from "../types";

export default function RemindersModuleView() {
  const {
    getAll: fetchReminders,
    remove: deleteItem,
    loading,
    error,
  } = useReminder();
  const { getAll: fetchUsers, loading: loadingUsers } = useUser();
  const [users, setUsers] = useState<UserWithRelations[]>([]);

  useEffect(() => {
    const getFilterData = async () => {
      try {
        const usersData = await fetchUsers({ limit: 1000, page: 1 });
        setUsers(usersData?.data || []);
      } catch (e) {
        console.error("Error fetching filter data:", e);
      }
    };
    getFilterData();
  }, []);

  if (loadingUsers) return <Loading />;

  const filters: FilterOption[] = [];
  if (users.length > 0) {
    const userOptions = users.map((user) => ({
      value: user.id,
      label: user.name || user.phone || `کاربر ${user.id}`,
    }));
    filters.push({
      name: "userId",
      label: "کاربر",
      options: [{ value: "all", label: "همه کاربران" }, ...userOptions],
    });
  }
  const statusOptions = Object.values(ReminderStatus).map((status) => ({
    value: status,
    label: {
      PENDING: "در انتظار",
      COMPLETED: "ارسال شده",
      CANCELLED: "لغو شده",
    }[status],
  }));
  filters.push({
    name: "status",
    label: "وضعیت",
    options: [{ value: "all", label: "همه وضعیت‌ها" }, ...statusOptions],
  });

  return (
    <DataTableWrapper<ReminderWithDetails>
      title="مدیریت یادآورها"
      columns={columns}
      loading={loading}
      error={error}
      fetcher={fetchReminders}
    //  deleteItem={deleteItem}
      filterOptions={filters}
      createUrl="/dashboard/reminders/create"
    />
  );
}

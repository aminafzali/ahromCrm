import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { FilterOption } from "@/@Client/types";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { useEffect, useState } from "react";
import { columnsForAdmin, listItemRender2 } from "../data/table";
import { useNotification } from "../hooks/useNotification";

export default function IndexPage({ title = "اعلان‌ها" }) {
  const { getAll, loading, error } = useNotification();
  const { getAll: getAllUserGroups } = useUserGroup();
  const { getAll: getAllLabels } = useLabel();

  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [ug, lb] = await Promise.all([
        getAllUserGroups({ page: 1, limit: 1000 }).then((r) => r.data),
        getAllLabels({ page: 1, limit: 1000 }).then((r) => r.data),
      ]);
      setUserGroups(ug || []);
      setLabels(lb || []);
    })();
  }, []);

  // ساخت گزینه‌های فیلتر برای DataTableWrapper2
  const filters: FilterOption[] = [];

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
  const dateFilters = [{ name: "createdAt", label: "تاریخ ایجاد" }];

  return (
    <div>
      <DataTableWrapper
        title="اعلان ها"
        columns={columnsForAdmin}
        loading={loading}
        error={error}
        fetcher={getAll}
        listItemRender={listItemRender2}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        createUrl="/dashboard/notifications/create"
      />
    </div>
  );
}

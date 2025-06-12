import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import { columns, listItemRender } from "../data/table";
import { useNotification } from "../hooks/useNotification";
import { NotificationWithRelations } from "../types";

export default function IndexPage({ title = "اعلان‌ها" }) {
  const { getAll, loading, error } = useNotification();
  return (
    <DataTableWrapper<NotificationWithRelations>
      columns={columns}
      loading={loading}
      error={error}
      title={title}
      fetcher={getAll}
      defaultViewMode="list"
      showIconViews={false}
      onSearch={false}
      listItemRender={listItemRender}
    />
  );
}
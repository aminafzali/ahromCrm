import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import {
  columnsForAdmin,
  listItemRender,
  listItemRender2,
} from "../data/table";
import { useNotification } from "../hooks/useNotification";
import { NotificationRepository } from "../repo/NotificationRepository";
import { NotificationWithRelations } from "../types";

export default function IndexPage({ title = "اعلان‌ها" }) {
  const { getAll, loading, error } = useNotification();
  return (
    <div>
      <IndexWrapper
        title="اعلان ها"
        columns={columnsForAdmin}
        listItemRender={listItemRender2}
        repo={new NotificationRepository()}
      />
      <DataTableWrapper<NotificationWithRelations>
        columns={columnsForAdmin}
        loading={loading}
        error={error}
        title={title}
        fetcher={getAll}
        defaultViewMode="list"
        showIconViews={false}
        onSearch={false}
        listItemRender={listItemRender}
      />
    </div>
  );
}

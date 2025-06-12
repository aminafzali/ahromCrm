import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin, columnsForUser } from "../data/table";
import { InvoiceRepository } from "../repo/InvoiceRepository";

export default function IndexPage({ isAdmin = false, title = "صورتحساب‌" }) {
  return (
    <IndexWrapper
      title={title}
      columns={isAdmin ? columnsForAdmin : columnsForUser}
      defaultViewMode="table"
      showIconViews={false}
      repo={new InvoiceRepository()}
    />
  );
}

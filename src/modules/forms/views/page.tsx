import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin } from "../data/table";
import { FormRepository } from "../repo/FormRepository";

export default function IndexPage() {
  return (
    <div>
      <IndexWrapper
        columns={columnsForAdmin}
        repo={new FormRepository()}
        title="فرم‌ها"
      />
    </div>
  );
}

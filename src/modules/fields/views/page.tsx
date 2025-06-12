import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin, listItemRender } from "../data/table";
import { FieldRepository } from "../repo/FieldRepository";

export default function IndexPage({}) {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      listItemRender={listItemRender}
      repo={new FieldRepository()}
    />
  );
}

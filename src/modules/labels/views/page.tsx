import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin, listItemRender } from "../data/table";
import { LabelRepository } from "../repo/LabelRepository";

export default function IndexPage({}) {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      listItemRender={listItemRender}
      repo={new LabelRepository()}
    />
  );
}

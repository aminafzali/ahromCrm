import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin, listItemRender } from "../data/table";
import { UserGroupRepository } from "../repo/UserGroupRepository";

export default function IndexPage({}) {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      listItemRender={listItemRender}
      repo={new UserGroupRepository()}
    />
  );
}

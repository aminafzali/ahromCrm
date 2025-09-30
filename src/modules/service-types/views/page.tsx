import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columns, listItemRender } from "../data/table";
import { ServiceTypeRepository } from "../repo/ServiceTypeRepository";

export default function IndexPage({}) {
  return (
    <IndexWrapper
      columns={columns}
      listItemRender={listItemRender}
      repo={new ServiceTypeRepository()}
    />
  );
}

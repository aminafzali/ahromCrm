import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin, listItemRender } from "../data/table";
import { BrandRepository } from "../repo/BrandRepository";

export default function IndexPage({ isAdmin = true, title = "برندها" }) {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      listItemRender={listItemRender}
      repo={new BrandRepository()}
    />
  );
}

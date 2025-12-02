import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useProduct } from "@/modules/products/hooks/useProduct";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getPurchaseOrderFormConfig } from "../../data/form";
import { PurchaseOrderRepository } from "../../repo/PurchaseOrderRepository";

export default function CreatePurchaseOrderPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll: getAllProducts } = useProduct();
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();

  return (
    <CreateWrapper
      fetchers={[
        {
          key: "products",
          fetcher: () =>
            getAllProducts({ page: 1, limit: 100 }).then((res) => res.data),
        },
        {
          key: "suppliers",
          fetcher: () =>
            getAllWorkspaceUsers({ page: 1, limit: 100 }).then(
              (res) => res.data
            ),
        },
      ]}
      title="سفارش خرید جدید"
      backUrl={back}
      formConfig={getPurchaseOrderFormConfig}
      after={after}
      repo={new PurchaseOrderRepository()}
    />
  );
}

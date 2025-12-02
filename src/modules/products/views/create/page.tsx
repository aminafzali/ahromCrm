import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useBrand } from "@/modules/brands/hooks/useBrand";
import { useCategory } from "@/modules/categories/hooks/useCategory";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { useRouter } from "next/navigation";
import { getProductFormConfig } from "../../data/form";
import { ProductRepository } from "../../repo/ProductRepository";

export default function CreateProductPage({
  back = true,
  after,
}: CreatePageProps) {
  const router = useRouter();

  const { getAll: getAllBrands } = useBrand();
  const { getAll: getAllCategories } = useCategory();
  const { getAll: getAllUserGroups } = useUserGroup();

  return (
    <CreateWrapper
      fetchers={[
        {
          key: "brands",
          fetcher: () =>
            getAllBrands({ page: 1, limit: 50 }).then((res) => res.data),
        },
        {
          key: "categories",
          fetcher: () =>
            getAllCategories({ page: 1, limit: 50 }).then((res) => res.data),
        },
        {
          key: "userGroups",
          fetcher: () =>
            getAllUserGroups({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      title="محصول جدید"
      backUrl={back}
      formConfig={getProductFormConfig}
      after={after}
      repo={new ProductRepository()} // ✅ Now properly typed
    />
  );
}

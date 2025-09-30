import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import { FilterOption } from "@/@Client/types";
import { useBrand } from "@/modules/brands/hooks/useBrand";
import { BrandWithRelations } from "@/modules/brands/types";
import Tree from "@/modules/categories/components/Tree";
import { useCategory } from "@/modules/categories/hooks/useCategory";
import { useCategoryTree } from "@/modules/categories/hooks/useCategoryTree";
import { CategoryWithRelations } from "@/modules/categories/types";
import { useProduct } from "@/modules/products/hooks/useProduct";
import { ProductWithRelations } from "@/modules/products/types";
import { Button } from "ndui-ahrom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { columnsForAdmin, listItemRender } from "../data/table";

export default function IndexPage({ isAdmin = true, title = "محصولات" }) {
  const { getAll, loading, error } = useProduct();
  const { getAll: getAllBrands, loading: loadingBrands } = useBrand();
  const { getAll: getAllCategories, loading: loadingCategories } =
    useCategory();

  const [brands, setBrands] = useState<BrandWithRelations[]>([]);
  const [categories, setCategories] = useState<CategoryWithRelations[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { treeData } = useCategoryTree(categories);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [brandsData, categoriesData] = await Promise.all([
        getAllBrands({ page: 1, limit: 100 }),
        getAllCategories({ page: 1, limit: 100 }),
      ]);

      setBrands(brandsData.data);
      setCategories(categoriesData.data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const filters: FilterOption[] = useMemo(
    () => [
      {
        name: "brandId",
        label: "برند",
        options: [
          { value: "all", label: "همه" },
          ...brands.map((brand) => ({
            value: brand.id.toString(),
            label: brand.name,
          })),
        ],
      },
    ],
    [brands]
  );

  const handleNodeClick = useCallback((node) => {
    setSelectedCategory(node.id);
  }, []);

  const extraFilter = useMemo(
    () => ({ categoryId: selectedCategory }),
    [selectedCategory]
  );

  return (
    <>
      {loadingBrands || loadingCategories ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* سایدبار دسته‌بندی‌ها */}
          <div className="lg:col-span-1">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold mb-4">دسته‌بندی‌ها</h2>
              {selectedCategory && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCategory(null)}
                  icon={
                    <DIcon
                      icon="fa-trash"
                      cdi={false}
                      classCustom="text-error text-lg font-bold"
                    />
                  }
                ></Button>
              )}
            </div>
            <Tree
              selected={extraFilter.categoryId}
              data={treeData}
              onNodeClick={handleNodeClick}
            />
          </div>

          {/* جدول محصولات */}
          <div className="lg:col-span-3">
            <DataTableWrapper<ProductWithRelations>
              columns={columnsForAdmin}
              createUrl="/dashboard/products/create"
              loading={loading}
              error={error}
              title={title}
              fetcher={getAll}
              extraFilter={extraFilter}
              filterOptions={filters}
              listItemRender={listItemRender}
              defaultViewMode="list"
              onClear={() => setSelectedCategory(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}

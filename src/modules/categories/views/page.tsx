import ButtonDelete from "@/@Client/Components/common/ButtonDelete";
import DIcon from "@/@Client/Components/common/DIcon";
import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import ButtonCreate from "@/components/ButtonCreate/ButtonCreate";
import { useEffect, useState } from "react";
import Tree from "../components/Tree";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useCategory } from "../hooks/useCategory";
import { useCategoryTree } from "../hooks/useCategoryTree";
import { CategoryWithRelations } from "../types";
import CreateCategoryPage from "./create/page";

export default function IndexPage({ isAdmin = true, title = "دسته‌بندی‌ها" }) {
  const { getAll, loading, error, remove } = useCategory();
  const [categories, setCategories] = useState<CategoryWithRelations[]>([]);
  const { treeData } = useCategoryTree(categories);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await getAll({ page: 1, limit: 100 });
      setCategories(result.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="">
        <h2 className="text-lg font-semibold mb-4">ساختار دسته‌بندی</h2>
        <Tree
          data={treeData}
          addNode={(node) => (
            <ButtonCreate
              size="sm"
              variant="ghost"
              icon={
                <DIcon icon="fa-plus" cdi={false} classCustom="!mx-0 text-xl" />
              }
              modalContent={(closeModal) => (
                <CreateCategoryPage
                  back={false}
                  defaultValues={{ parent: node }}
                  after={() => {
                    fetchCategories();
                    closeModal(); // بستن مودال بعد از ثبت دسته‌بندی
                  }}
                />
              )}
            />
          )}
          removeNode={(node) => (
            <ButtonDelete
              showLabel={false}
              size="sm"
              row={node}
              onDelete={handleDelete}
            />
          )}
        />
      </div>

      <div className="lg:col-span-2">
        <DataTableWrapper<CategoryWithRelations>
          columns={columnsForAdmin}
          createUrl="/dashboard/categories/create"
          loading={loading}
          error={error}
          title={title}
          fetcher={getAll}
          listItemRender={listItemRender}
          listClassName="grid grid-cols-1 gap-2"
        />
      </div>
    </div>
  );
}

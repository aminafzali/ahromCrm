import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCategory } from "../../hooks/useCategory";
import { CategoryWithRelations } from "../../types";

interface CategoryDetailsViewProps {
  id: number;
}

export default function DetailPage({ id }: CategoryDetailsViewProps) {
  const {
    getById,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
    remove,
  } = useCategory();
  const [category, setCategory] = useState<CategoryWithRelations>({} as CategoryWithRelations);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchCategoryDetails();
    }
  }, [id]);

  const fetchCategoryDetails = async () => {
    try {
      const data = await getById(id);
       if(data != undefined){
        setCategory(data);
      }
     
    } catch (error) {
      console.error("Error fetching category details:", error);
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/categories");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const customRenderers = {
    parent: (value: any) => value?.name || "-",
    children: (value: any[]) => (
      <div className="grid gap-2">
        {value?.map((child) => (
          <div key={child.id} className="p-2 bg-gray-50 rounded">
            <span className="font-medium">{child.name}</span>
            <span className="text-gray-500 text-sm ml-2">
              ({child._count.products} محصول)
            </span>
          </div>
        ))}
      </div>
    ),
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={category}
      title="دسته‌بندی"
      excludeFields={["id", "createdAt", "updatedAt", "_count", "lft", "rgt", "depth"]}
      loading={loading}
      error={error}
      success={success}
      customRenderers={customRenderers}
      onDelete={handleDelete}
      editUrl={`/dashboard/categories/${id}/update`}
    />
  );
}
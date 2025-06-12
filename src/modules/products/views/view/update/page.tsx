import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DynamicUpdateWrapper from "@/@Client/Components/wrappers/DynamicUpdateWrapper";
import { useBrand } from "@/modules/brands/hooks/useBrand";
import { BrandWithRelations } from "@/modules/brands/types";
import { useCategory } from "@/modules/categories/hooks/useCategory";
import { CategoryWithRelations } from "@/modules/categories/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getProductFormConfig } from "../../../data/form";
import { useProduct } from "../../../hooks/useProduct";
import { createProductSchema } from "../../../validation/schema";

interface UpdateProductPageProps {
  id: number;
}

export default function UpdateProductPage({ id }: UpdateProductPageProps) {
  const router = useRouter();
  const {
    getById,
    update,
    remove,
    submitting: loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useProduct();
  const { getAll: getAllBrands, loading: loadingBrands } = useBrand();
  const { getAll: getAllCategories, loading: loadingCategories } =
    useCategory();
  const [brands, setBrands] = useState<BrandWithRelations[]>([]);
  const [categories, setCategories] = useState<CategoryWithRelations[]>([]);
  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const [mainData, brandsData, categoriesData] = await Promise.all([
        getById(id),
        getAllBrands({ page: 1, limit: 100 }),
        getAllCategories({ page: 1, limit: 100 }),
      ]);

      setProductData(mainData);
      setBrands(brandsData.data);
      setCategories(categoriesData.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleSubmit = async (data: z.infer<typeof createProductSchema>) => {
    try {
      await update(id, data);
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  if (dataLoading || loadingBrands || loadingCategories) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  const data = new Map<string, any>();
  data.set("brands", brands);
  data.set("categories", categories);

  return (
    <div className="space-y-6">
      <DynamicUpdateWrapper
        title="ویرایش محصول"
        backUrl="/dashboard/products"
        formConfig={getProductFormConfig(data)}
        defaultValues={productData}
        onSubmit={handleSubmit}
        entityId={id}
        isLoading={loading}
        error={error}
        success={success}
      />
    </div>
  );
}

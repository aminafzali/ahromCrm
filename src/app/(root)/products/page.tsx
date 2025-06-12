"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import Select22 from "@/@Client/Components/wrappers/Select22";
import { useBrand } from "@/modules/brands/hooks/useBrand";
import { BrandWithRelations } from "@/modules/brands/types";
import { useCategory } from "@/modules/categories/hooks/useCategory";
import { CategoryWithRelations } from "@/modules/categories/types";
import ProductCard from "@/modules/products/components/ProductCard";
import { useProduct } from "@/modules/products/hooks/useProduct";
import { ProductWithRelations } from "@/modules/products/types";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { z } from "zod";

const filtersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  maxPrice: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  inStock: z.boolean().default(false),
});

export default function ProductsPage() {
  const { getAll: getProducts, loading: loadingProducts } = useProduct();
  const { getAll: getCategories, loading: loadingCategories } = useCategory();
  const { getAll: getBrands, loading: loadingBrands } = useBrand();

  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<CategoryWithRelations[]>([]);
  const [brands, setBrands] = useState<BrandWithRelations[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    brandId: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        getCategories(),
        getBrands(),
      ]);
      setCategories(categoriesData.data);
      setBrands(brandsData.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const queryParams = {
        search: filters.search,
        categoryId: filters.categoryId || undefined,
        brandId: filters.brandId || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        inStock: filters.inStock || undefined,
        page: 1, // Default to page 1
        limit: 50, // Default to 10 items per page
      };

      const result = await getProducts(queryParams);
      setProducts(result.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      categoryId: "",
      brandId: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
    });
  };

  if (loadingCategories || loadingBrands) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">محصولات</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            name="search"
            placeholder="جستجو در محصولات..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />

          <Select22
            name="categoryId"
            placeholder="دسته‌بندی"
            value={filters.categoryId}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
            options={[
              { value: "", label: "همه دسته‌ها" },
              ...categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
            ]}
          />

          <Select22
            name="brandId"
            placeholder="برند"
            value={filters.brandId}
            onChange={(e) => handleFilterChange("brandId", e.target.value)}
            options={[
              { value: "", label: "همه برندها" },
              ...brands.map((brand) => ({
                value: brand.id,
                label: brand.name,
              })),
            ]}
          />

          <div className="flex gap-2">
            <Input
              type="number"
              name="minPrice"
              placeholder="حداقل قیمت"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <Input
              type="number"
              name="maxPrice"
              placeholder="حداکثر قیمت"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange("inStock", e.target.checked)}
              className="checkbox checkbox-primary"
            />
            <span>فقط کالاهای موجود</span>
          </label>

          <Button
            variant="ghost"
            onClick={handleReset}
            icon={
              <DIcon icon="fa-rotate-left" cdi={false} classCustom="ml-2" />
            }
          >
            پاک کردن فیلترها
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {loadingProducts ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

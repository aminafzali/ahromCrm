"use client";

import Link from "next/link";
import ProductPrice from "./ProductPrice";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    description?: string;
    images?: Array<{ url: string }>;
    brand?: { name: string };
    category?: { name: string };
  };
  workspaceSlug?: string;
}

export default function ProductCard({
  product,
  workspaceSlug = "shop",
}: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url || "/placeholder-product.jpg";

  return (
    <Link
      href={`/${workspaceSlug}/products/${product.id}`}
      className="block bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden"
    >
      {/* تصویر */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.brand && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs">
            {product.brand.name}
          </div>
        )}
      </div>

      {/* اطلاعات */}
      <div className="p-4 space-y-3">
        {/* دسته‌بندی */}
        {product.category && (
          <p className="text-xs text-gray-500">{product.category.name}</p>
        )}

        {/* نام */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* توضیحات */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* قیمت */}
        <ProductPrice
          productId={product.id}
          defaultPrice={product.price}
          className="mt-4"
        />
      </div>
    </Link>
  );
}


"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import { useState } from "react";

export default function ProductDetails({ product }: { product: any }) {
  const [selectedImage, setSelectedImage] = useState(product.images?.[0]?.url || null);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={selectedImage || product.images?.[0]?.url}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image: any) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image.url)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === image.url
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-gray-600 mt-1">{product.brand.name}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary">
                {product.price.toLocaleString()} تومان
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  product.stock > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock > 0 ? "موجود در انبار" : "ناموجود"}
              </div>
            </div>

            {product.category && (
              <div className="flex items-center text-gray-600">
                <DIcon icon="fa-folder" cdi={false} classCustom="ml-2" />
                <span>دسته‌بندی:</span>
                <span className="mr-2">
                  {product.category.parent && (
                    <>
                      <span>{product.category.parent.name}</span>
                      <span className="mx-2">/</span>
                    </>
                  )}
                  {product.category.name}
                </span>
              </div>
            )}

            {product.description && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">توضیحات محصول</h3>
                <div
                  className="text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <Button
                className="w-full"
                size="lg"
                disabled={product.stock <= 0}
                icon={<DIcon icon="fa-cart-plus" cdi={false} classCustom="ml-2" />}
              >
                افزودن به سبد خرید
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
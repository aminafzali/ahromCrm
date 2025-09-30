import React from 'react';
import Link from 'next/link';
import { ProductWithRelations } from '../types';
import DIcon from '@/@Client/Components/common/DIcon';

interface ProductCardProps {
  product: ProductWithRelations;
  isAdmin?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin = false }) => {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-lg">
            <DIcon icon="fa-image" cdi={false} classCustom="text-4xl text-gray-400" />
          </div>
        )}
        {!product.isActive && (
          <div className="absolute top-2 right-2 bg-error text-white px-2 py-1 rounded text-xs">
            غیرفعال
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute top-2 left-2 bg-warning text-warning-content px-2 py-1 rounded text-xs">
            ناموجود
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          {product.brand && (
            <span className="text-sm text-gray-500">{product.brand.name}</span>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          {product.category && (
            <span className="flex items-center">
              <DIcon icon="fa-folder" cdi={false} classCustom="mr-1" />
              {product.category.name}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-primary font-bold">
            {product.price.toLocaleString()} تومان
          </span>
          <span className="text-sm">
            موجودی: {product.stock}
          </span>
        </div>

        {isAdmin && (
          <div className="mt-4 pt-4 border-t flex justify-between">
            <Link 
              href={`/dashboard/products/${product.id}`}
              className="text-primary hover:underline text-sm flex items-center"
            >
              <DIcon icon="fa-eye" cdi={false} classCustom="ml-1" />
              مشاهده
            </Link>
            <Link 
              href={`/dashboard/products/${product.id}/update`}
              className="text-info hover:underline text-sm flex items-center"
            >
              <DIcon icon="fa-edit" cdi={false} classCustom="ml-1" />
              ویرایش
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
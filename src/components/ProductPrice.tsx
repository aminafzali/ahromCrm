"use client";

import { useEffect, useState } from "react";

interface ProductPriceProps {
  productId: number;
  defaultPrice: number;
  className?: string;
  showOriginalPrice?: boolean;
}

interface PriceInfo {
  basePrice: number;
  finalPrice: number;
  discountPrice?: number;
  discountPercent?: number;
  hasDiscount: boolean;
  isDiscountActive: boolean;
}

export default function ProductPrice({
  productId,
  defaultPrice,
  className = "",
  showOriginalPrice = true,
}: ProductPriceProps) {
  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    basePrice: defaultPrice,
    finalPrice: defaultPrice,
    hasDiscount: false,
    isDiscountActive: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrice();
  }, [productId]);

  const loadPrice = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/price`);
      if (response.ok) {
        const data = await response.json();
        setPriceInfo(data);
      }
    } catch (error) {
      console.error("Error loading price:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  const hasDiscount = priceInfo.hasDiscount && priceInfo.isDiscountActive;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* قیمت نهایی */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {priceInfo.finalPrice.toLocaleString("fa-IR")}
        </span>
        <span className="text-sm text-gray-600">تومان</span>
      </div>

      {/* قیمت اصلی و تخفیف */}
      {hasDiscount && showOriginalPrice && (
        <div className="flex items-center gap-2">
          <span className="text-lg text-gray-400 line-through">
            {priceInfo.basePrice.toLocaleString("fa-IR")}
          </span>
          {priceInfo.discountPercent && (
            <span className="px-2 py-1 bg-red-500 text-white text-sm rounded">
              {priceInfo.discountPercent.toFixed(0)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

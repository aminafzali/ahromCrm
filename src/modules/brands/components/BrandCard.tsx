import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import React from "react";
import { BrandWithRelations } from "../types";

interface BrandCardProps {
  brand: BrandWithRelations;
  isAdmin?: boolean;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, isAdmin = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-center gap-4">
        {brand.logoUrl ? (
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="w-16 h-16 object-contain rounded"
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
            <DIcon
              icon="fa-building"
              cdi={false}
              classCustom="text-2xl text-gray-400"
            />
          </div>
        )}

        <div className="flex-grow">
          <h3 className="font-semibold text-lg">{brand.name}</h3>
          {brand.website && (
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline flex items-center mt-1"
            >
              <DIcon icon="fa-globe" cdi={false} classCustom="ml-1" />
              {brand.website}
            </a>
          )}
        </div>

        <div className="text-center">
          <span className="text-2xl font-bold text-primary">{0}</span>
          <p className="text-sm text-gray-500">محصول</p>
        </div>
      </div>

      {brand.description && (
        <p className="mt-4 text-gray-600 text-sm line-clamp-2">
          {brand.description}
        </p>
      )}

      {isAdmin && (
        <div className="mt-4 pt-4 border-t flex justify-end gap-4">
          <Link
            href={`/dashboard/brands/${brand.id}`}
            className="text-primary hover:underline text-sm flex items-center"
          >
            <DIcon icon="fa-eye" cdi={false} classCustom="ml-1" />
            مشاهده
          </Link>
          <Link
            href={`/dashboard/brands/${brand.id}/update`}
            className="text-info hover:underline text-sm flex items-center"
          >
            <DIcon icon="fa-edit" cdi={false} classCustom="ml-1" />
            ویرایش
          </Link>
        </div>
      )}
    </div>
  );
};

export default BrandCard;

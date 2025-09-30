// src/modules/payment-categories/components/PaymentCategoryTree.tsx
import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import React from "react";

interface PaymentCategoryNode {
  id: string; // در پریزما این فیلد از نوع رشته (String) است
  name: string;
  children?: PaymentCategoryNode[];
  _count?: {
    payments: number; // رابطه از products به payments تغییر کرد
    children: number;
  };
}

interface PaymentCategoryTreeProps {
  paymentCategories: PaymentCategoryNode[];
  onSelect?: (category: PaymentCategoryNode) => void;
  selectedId?: string; // در پریزما این فیلد از نوع رشته (String) است
}

const PaymentCategoryTree: React.FC<PaymentCategoryTreeProps> = ({
  paymentCategories,
  onSelect,
  selectedId,
}) => {
  const renderCategory = (category: PaymentCategoryNode, level: number = 0) => {
    const isSelected = category.id === selectedId;
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`
            flex items-center justify-between p-2 my-1 rounded-lg cursor-pointer
            ${
              isSelected
                ? "bg-primary text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }
          `}
          onClick={() => onSelect?.(category)}
        >
          <div className="flex items-center">
            <DIcon
              icon={hasChildren ? "fa-folder" : "fa-folder-open"}
              cdi={false}
              classCustom="ml-2"
            />
            <span>{category.name}</span>
          </div>
          <div className="flex items-center text-sm">
            {category._count && (
              <>
                <span className="mx-2">{category._count.payments} پرداخت</span>
                {hasChildren && (
                  <span className="mx-2">
                    {category._count.children} زیردسته
                  </span>
                )}
              </>
            )}
            {onSelect && (
              <Link
                href={`/dashboard/payment-categories/${category.id}`} // مسیر لینک اصلاح شد
                className={isSelected ? "text-white" : "text-primary"}
                onClick={(e) => e.stopPropagation()}
              >
                <DIcon icon="fa-eye" cdi={false} classCustom="mx-2" />
              </Link>
            )}
          </div>
        </div>
        {hasChildren &&
          category.children?.map((child) => renderCategory(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {paymentCategories.map((cat) => renderCategory(cat))}
    </div>
  );
};

export default PaymentCategoryTree;

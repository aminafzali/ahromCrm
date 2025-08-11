// مسیر فایل: src/modules/payment-categories/components/PaymentCategoryTree.tsx

import { Button } from "ndui-ahrom";
import Link from "next/link";
import React from "react";
import { TreeNode } from "../types";
import Tree from "./Tree";

interface PaymentCategoryTreeProps {
  categories: TreeNode[];
}

const PaymentCategoryTree: React.FC<PaymentCategoryTreeProps> = ({
  categories,
}) => {
  const renderNode = (node: TreeNode, level: number) => {
    const getTypeLabel = (type: string) => {
      switch (type) {
        case "INCOME":
          return <span className="badge badge-success text-xs">درآمد</span>;
        case "EXPENSE":
          return <span className="badge badge-error text-xs">هزینه</span>;
        case "TRANSFER":
          return <span className="badge badge-info text-xs">انتقال</span>;
        default:
          return null;
      }
    };

    return (
      <div
        className={`flex items-center justify-between p-3 my-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg hover:shadow-sm transition-shadow`}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {node.name}
          </span>
          {getTypeLabel(node.type)}
          <span className="text-xs text-slate-400">
            ({node._count?.payments} پرداخت)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/payment-categories/${node.id}/update`}>
            <Button size="sm" className="btn-primary">
              ویرایش
            </Button>
          </Link>
          <Link href={`/dashboard/payment-categories/${node.id}`}>
            <Button size="sm" variant="ghost">
              مشاهده
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return <Tree nodes={categories} renderNode={renderNode} />;
};

export default PaymentCategoryTree;

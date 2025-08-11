// مسیر فایل: src/modules/payment-categories/components/PaymentCategorySelect2.tsx

"use client";

import Select22 from "@/@Client/Components/wrappers/Select22";
import { useEffect, useState } from "react";
import { usePaymentCategory } from "../hooks/usePaymentCategory";
import { PaymentCategoryWithRelations, TreeNode } from "../types";

interface Option {
  value: number;
  label: string;
}

interface PaymentCategorySelectProps {
  name: string;
  label: string;
  value?: number;
  onChange: (value: any) => void;
}

const PaymentCategorySelect2: React.FC<PaymentCategorySelectProps> = ({
  name,
  label,
  value,
  onChange,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const { getAll, loading } = usePaymentCategory();

  useEffect(() => {
    const fetchAndProcessCategories = async () => {
      try {
        const res = await getAll({ page: 1, limit: 1000 });
        if (res?.data) {
          const tree = buildTree(res.data);
          const flattenedOptions = flattenTree(tree);
          setOptions(flattenedOptions);
        }
      } catch (error) {
        console.error("Error fetching payment categories:", error);
      }
    };
    fetchAndProcessCategories();
  }, []);

  const buildTree = (items: PaymentCategoryWithRelations[]): TreeNode[] => {
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];
    items.forEach((item) => map.set(item.id, { ...item, children: [] }));
    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });
    return roots;
  };

  const flattenTree = (nodes: TreeNode[], level = 0): Option[] => {
    let result: Option[] = [];
    for (const node of nodes) {
      result.push({
        value: node.id,
        label: `${"— ".repeat(level)} ${node.name}`,
      });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children, level + 1));
      }
    }
    return result;
  };

  if (loading) return <div>در حال بارگذاری دسته‌بندی‌ها...</div>;

  return (
    <Select22
      name={name}
      label={label}
      options={options}
     // value={value}
      onChange={onChange}
      placeholder="انتخاب دسته‌بندی پرداخت..."
    />
  );
};

export default PaymentCategorySelect2;

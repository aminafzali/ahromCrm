// مسیر فایل: src/modules/payment-categories/views/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { Button } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useState } from "react";
import PaymentCategoryTree from "../components/PaymentCategoryTree";
import { usePaymentCategory } from "../hooks/usePaymentCategory";
import { usePaymentCategoryTree } from "../hooks/usePaymentCategoryTree";
import { PaymentCategoryWithRelations } from "../types";

export default function IndexPage() {
  const { getAll, loading, error } = usePaymentCategory();
  const [categories, setCategories] = useState<PaymentCategoryWithRelations[]>([]);
  const { treeData } = usePaymentCategoryTree(categories);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAll({ page: 1, limit: 1000 });
        if (res?.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchData();
  }, [getAll]);

  if (loading) return <Loading />;
  if (error) return <div>خطا در بارگذاری داده‌ها</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مدیریت دسته‌بندی‌های پرداخت</h1>
        <Link href="/dashboard/payment-categories/create">
          <Button>
            <DIcon icon="fa-plus" classCustom="ml-2" />
            ایجاد دسته‌بندی جدید
          </Button>
        </Link>
      </div>
      <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
        <PaymentCategoryTree categories={treeData} />
      </div>
    </div>
  );
}
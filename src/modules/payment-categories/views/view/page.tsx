// مسیر فایل: src/modules/payment-categories/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePaymentCategory } from "../../hooks/usePaymentCategory";
import { PaymentCategoryWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { getById, loading, error, success, statusCode, remove } = usePaymentCategory();
  const [category, setCategory] = useState<PaymentCategoryWithRelations | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getById(id);
        if (data) setCategory(data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    if (id) {
      fetchDetails();
    }
  }, [id, getById]);

  const handleDelete = async (row: any) => {
    if(row._count?.payments > 0 || row._count?.children > 0) {
        alert("این دسته‌بندی به دلیل داشتن پرداخت یا زیرمجموعه، قابل حذف نیست.");
        return;
    }
    try {
      await remove(row.id);
      router.push("/dashboard/payment-categories");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const displayData = category ? {
    "نام": category.name,
    "اسلاگ": category.slug,
    "نوع": category.type,
    "والد": category.parent?.name || "ندارد",
    "تعداد پرداخت‌ها": category._count?.payments,
    "تعداد زیرمجموعه‌ها": category._count?.children,
    "توضیحات": category.description || "-",
  } : {};

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات دسته‌بندی پرداخت"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(category)}
      editUrl={`/dashboard/payment-categories/${category?.id}/update`}
    />
  );
}
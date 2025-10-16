"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupportInfoCategory } from "../../hooks/useSupportCategory";
import { SupportInfoCategoryWithRelations } from "../../types";

export default function SupportInfoCategoryDetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const { getById, loading, error, success, statusCode, remove } =
    useSupportInfoCategory();
  const [category, setCategory] =
    useState<SupportInfoCategoryWithRelations | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getById(id);
        if (data) setCategory(data);
      } catch (error) {}
    };
    if (id) fetchDetails();
  }, [id]);

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/support-info-categories");
    } catch (error) {}
  };

  const displayData = category
    ? {
        نام: category.name,
        والد: category.parent?.name || "ندارد",
        "تعداد زیرمجموعه‌ها": category._count?.children || 0,
        "تعداد تیکت‌ها": category._count?.supportInfo || 0,
      }
    : {};

  if (!id) return <NotFound />;
  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات دسته‌بندی پشتیبانی"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(category)}
      editUrl={`/dashboard/support-info-categories/${category?.id}/update`}
    />
  );
}

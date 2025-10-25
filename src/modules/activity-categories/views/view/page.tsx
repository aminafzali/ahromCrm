"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActivityCategory } from "../../hooks/useActivityCategory";
import { ActivityCategoryWithRelations } from "../../types";

export default function ActivityCategoryDetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const { getById, loading, error, success, statusCode, remove } =
    useActivityCategory();
  const [category, setCategory] =
    useState<ActivityCategoryWithRelations | null>(null);
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
      router.push("/dashboard/activity-categories");
    } catch (error) {}
  };

  const displayData = category
    ? {
        نام: category.name,
        والد: category.parent?.name || "ندارد",
        "تعداد زیرمجموعه‌ها": category._count?.children || 0,
        "تعداد فعالیت‌ها": category._count?.activities || 0,
      }
    : {};

  if (!id) return <NotFound />;
  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات دسته‌بندی فعالیت"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(category)}
      editUrl={`/dashboard/activity-categories/${category?.id}/update`}
    />
  );
}

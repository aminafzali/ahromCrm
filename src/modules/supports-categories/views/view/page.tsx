"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupportCategory } from "../../hooks/useSupportCategory";
import { SupportCategoryWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { getById, loading, error, success, statusCode, remove } =
    useSupportCategory();
  const [category, setCategory] = useState<SupportCategoryWithRelations | null>(
    null
  );
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
      router.push("/dashboard/supports-categories");
    } catch (error) {}
  };

  const displayData = category
    ? {
        نام: category.name,
        والد: category.parent?.name || "ندارد",
        "تعداد زیرمجموعه‌ها": category._count?.children || 0,
        "تعداد تیکت‌ها": category._count?.supports || 0,
      }
    : {};

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
      editUrl={`/dashboard/supports-categories/${category?.id}/update`}
    />
  );
}

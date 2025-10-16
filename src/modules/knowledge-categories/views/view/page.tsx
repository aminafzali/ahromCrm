"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useKnowledgeCategory } from "../../hooks/useKnowledgeCategory";

export default function DetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const { getById, loading, error, success, statusCode, remove } =
    useKnowledgeCategory();
  const [category, setCategory] = useState<any>(null);
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
      router.push("/dashboard/knowledge-categories");
    } catch (error) {}
  };

  const displayData = category
    ? {
        نام: category.name,
        والد: category.parent?.name || "ندارد",
      }
    : {};

  if (!id) return <NotFound />;
  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات دسته‌بندی پایگاه دانش"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(category)}
      editUrl={`/dashboard/knowledge-categories/${category?.id}/update`}
    />
  );
}

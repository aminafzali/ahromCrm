// مسیر فایل: src/modules/actual-services/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActualService } from "../../hooks/useActualService";
import { ActualServiceWithRelations } from "../../types";

interface ActualServiceDetailsViewProps {
  id: number;
}

export default function DetailPage({ id }: ActualServiceDetailsViewProps) {
  const {
    getById,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
    remove,
  } = useActualService();

  const [actualService, setActualService] =
    useState<ActualServiceWithRelations>({} as ActualServiceWithRelations);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchActualServiceDetails();
    }
  }, [id]);

  const fetchActualServiceDetails = async () => {
    try {
      const data = await getById(id);
      setActualService(data);
    } catch (error) {
      console.error("Error fetching actual service details:", error);
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/actual-services");
    } catch (error) {
      console.error("Error deleting actual service:", error);
    }
  };

  const customRenderers = {
    // کامپوننت اضافی حذف شد و قیمت به صورت رشته نمایش داده می‌شود
    price: (value: number) => (
      <span>{value ? value.toLocaleString("fa-IR") + " تومان" : "-"}</span>
    ),
    serviceType: (value: { id: number; name: string }) =>
      value ? (
        <Link
          href={`/dashboard/service-types/${value.id}`}
          className="text-primary hover:underline"
        >
          {value.name}
        </Link>
      ) : (
        "-"
      ),
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={actualService}
      title="جزئیات خدمت"
      excludeFields={["id", "createdAt", "updatedAt", "serviceTypeId"]}
      loading={loading}
      error={error}
      success={success}
      customRenderers={customRenderers}
      onDelete={handleDelete}
      editUrl={`/dashboard/actual-services/${id}/update`}
    />
  );
}
"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useServiceType } from "../../hooks/useServiceType";
import { ServiceType } from "../../types";

interface ServiceTypeDetailsViewProps {
  id: number;
}

export default function DetailPage({ id }: ServiceTypeDetailsViewProps) {
  const router = useRouter();

  const {
    getById,
    remove,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useServiceType();
  const [serviceType, setServiceType] = useState<ServiceType>(
    {} as ServiceType
  );

  useEffect(() => {
    if (id) {
      fetchServiceTypeDetails();
    }
  }, [id]);

  const fetchServiceTypeDetails = async () => {
    try {
      const data = await getById(id);
      if (data != undefined) setServiceType(data);
    } catch (error) {
      console.error("Error fetching service type details:", error);
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/service-types");
    } catch (error) {
      console.error("Error deleting status:", error);
    }
  };

  const customRenderers = {
    basePrice: (value: number) => `${value.toLocaleString()} تومان`,
    isActive: (value: boolean) => (value ? "فعال" : "غیرفعال"),
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={serviceType}
      title="جزئیات نوع خدمت"
      excludeFields={["id", "updatedAt", "createdAt"]}
      customRenderers={customRenderers}
      loading={loading}
      error={error}
      success={success}
      onDelete={handleDelete}
      editUrl={`/dashboard/service-types/${id}/update`}
    />
  );
}

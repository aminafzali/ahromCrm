"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DynamicUpdateWrapper from "@/@Client/Components/wrappers/DynamicUpdateWrapper";
import { FormConfig } from "@/@Client/types/form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useServiceType } from "../../../hooks/useServiceType";
import { createServiceTypeSchema } from "../../../validation/schema";

interface UpdateServiceTypePageProps {
  id: number;
}

export default function UpdateServiceTypePage({
  id,
}: UpdateServiceTypePageProps) {
  const router = useRouter();
  const {
    getById,
    update,
    remove,
    submitting: loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useServiceType();
  const [serviceTypeData, setServiceTypeData] = useState<any>(null);

  useEffect(() => {
    fetchServiceType();
  }, [id]);

  const fetchServiceType = async () => {
    try {
      const data = await getById(id);
      setServiceTypeData(data);
    } catch (error) {
      console.error("Error fetching service type:", error);
    }
  };

  const handleSubmit = async (
    data: z.infer<typeof createServiceTypeSchema>
  ) => {
    try {
      await update(id, data);
      router.push("/dashboard/service-types");
    } catch (error) {
      console.error("Error updating service type:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await remove(id);
      router.push("/dashboard/service-types");
    } catch (error) {
      console.error("Error deleting service type:", error);
    }
  };

  if (!serviceTypeData) {
    return <div>Loading...</div>;
  }

  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: "نام خدمت",
        type: "text" as const,
        placeholder: "مثال: تعمیر یخچال",
        required: true,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea" as const,
        placeholder: "توضیحات خدمت را وارد کنید",
      },
      {
        name: "basePrice",
        label: "قیمت پایه (تومان)",
        type: "number" as const,
        placeholder: "مثال: 100000",
        required: true,
      },
    ],
    validation: createServiceTypeSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DynamicUpdateWrapper
      title="ویرایش نوع خدمت"
      backUrl="/dashboard/service-types"
      formConfig={formConfig}
      defaultValues={serviceTypeData}
      onSubmit={handleSubmit}
      entityId={id}
      isLoading={loading}
      error={error}
      success={success}
    />
  );
}

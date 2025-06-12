"use client";

import DynamicUpdateWrapper from "@/@Client/Components/wrappers/DynamicUpdateWrapper";
import { FormConfig } from "@/@Client/types/form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useStatus } from "../../../hooks/useStatus";
import { createStatusSchema } from "../../../validation/schema";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";

interface UpdateStatusPageProps {
  id: number;
}

export default function UpdateStatusPage({ id }: UpdateStatusPageProps) {
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
  } = useStatus();
  const [statusData, setStatusData] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
  }, [id]);

  const fetchStatus = async () => {
    try {
      const data = await getById(id);
      setStatusData(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const handleSubmit = async (data: z.infer<typeof createStatusSchema>) => {
    try {
      await update(id, data);
      router.push("/dashboard/statuses");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await remove(id);
      router.push("/dashboard/statuses");
    } catch (error) {
      console.error("Error deleting status:", error);
    }
  };

  if (!statusData) {
    return <div>Loading...</div>;
  }

  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: "نام وضعیت",
        type: "text" as const,
        placeholder: "مثال: در حال بررسی",
        required: true,
      },
      {
        name: "color",
        label: "رنگ",
        type: "color" as const,
        required: true,
      },
    ],
    validation: createStatusSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };



  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;
  

  return (
    <DynamicUpdateWrapper
      title="ویرایش وضعیت"
      backUrl="/dashboard/statuses"
      formConfig={formConfig}
      defaultValues={statusData}
      onSubmit={handleSubmit}
      entityId={id}
      isLoading={loading}
      error={error}
      success={success}
    />
  );
}

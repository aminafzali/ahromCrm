// src/modules/device-types/views/view/update/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DynamicUpdateWrapper from "@/@Client/Components/wrappers/DynamicUpdateWrapper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getDeviceTypeFormConfig } from "../../../data/form";
import { useDeviceType } from "../../../hooks/useDeviceType";
import { updateDeviceTypeSchema } from "../../../validation/schema";

interface UpdateDeviceTypePageProps {
  id: number;
}

export default function UpdateDeviceTypePage({
  id,
}: UpdateDeviceTypePageProps) {
  const router = useRouter();
  const {
    getById,
    update,
    submitting: loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useDeviceType();

  const [defaultValues, setDefaultValues] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const data = await getById(id);
      setDefaultValues(data);
    } catch (error) {
      console.error("Error fetching device type:", error);
    }
  };

  const handleSubmit = async (data: z.infer<typeof updateDeviceTypeSchema>) => {
    try {
      await update(id, data);
      router.push("/dashboard/device-types");
    } catch (error) {
      console.error("Error updating device type:", error);
    }
  };

  if (dataLoading || !defaultValues) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  // چون این فرم داده‌ خارجی ندارد، یک Map خالی ساخته و به تابع پاس می‌دهیم.
  // در آینده اگر فیلد select اضافه شد، این Map پر می‌شود.
  const formConfig = getDeviceTypeFormConfig(new Map());
  // schemaی ویرایش را جایگزین schemaی پیش‌فرض می‌کنیم
  formConfig.validation = updateDeviceTypeSchema;

  return (
    <div className="space-y-6">
      <DynamicUpdateWrapper
        title="ویرایش نوع دستگاه"
        backUrl="/dashboard/device-types"
        formConfig={formConfig}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        entityId={id}
        isLoading={loading}
        error={error}
        success={success}
      />
    </div>
  );
}

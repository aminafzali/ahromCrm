"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DynamicUpdateWrapper from "@/@Client/Components/wrappers/DynamicUpdateWrapper";
import { useBrand } from "@/modules/brands/hooks/useBrand";
import { useDeviceType } from "@/modules/device-types/hooks/useDeviceType";
import { useRequest } from "@/modules/requests/hooks/useRequest";
import { useUser } from "@/modules/users/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { getReceivedDeviceFormConfig } from "../../../data/form";
import { useReceivedDevice } from "../../../hooks/useReceivedDevice";
import { createReceivedDeviceSchema } from "../../../validation/schema";

interface UpdatePageProps {
  id: number;
}

export default function UpdatePage({ id }: UpdatePageProps) {
  const router = useRouter();
  const {
    getById,
    update,
    submitting,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useReceivedDevice();
  const { getAll: getAllRequests } = useRequest();
  const { getAll: getAllUsers } = useUser();
  const { getAll: getAllBrands } = useBrand();
  const { getAll: getAllDeviceTypes } = useDeviceType();

  const [defaultValues, setDefaultValues] = useState<any>(null);
  const [relatedData, setRelatedData] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const formConfig = useMemo(() => {
    const config = getReceivedDeviceFormConfig(relatedData);
    config.validation = createReceivedDeviceSchema;
    return config;
  }, [relatedData]);

  useEffect(() => {
    // ▼▼▼ اصلاح اصلی در اینجا اعمال شده است ▼▼▼
    // تابع واکشی فقط زمانی اجرا می‌شود که id یک عدد معتبر و مثبت باشد
    if (id && !isNaN(id) && id > 0) {
      fetchInitialData();
    } else {
      // اگر id معتبر نبود، لودینگ را متوقف می‌کنیم تا صفحه گیر نکند
      setIsLoading(false);
    }
  }, [id]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [mainData, requests, users, brands, deviceTypes] =
        await Promise.all([
          getById(id),
          // پارامتر اضافی include از اینجا حذف شده است
          getAllRequests({ page: 1, limit: 200 }),
          getAllUsers({ page: 1, limit: 200 }),
          getAllBrands({ page: 1, limit: 200 }),
          getAllDeviceTypes({ page: 1, limit: 200 }),
        ]);
      setDefaultValues(mainData);

      const dataMap = new Map<string, any>();
      dataMap.set(
        "requests",
        requests.data.map((req: any) => ({
          ...req,
          name: req.serviceType?.name || `درخواست #${req.trackingCode}`,
        }))
      );
      dataMap.set(
        "users",
        users.data.map((user: any) => ({
          ...user,
          name: user.name || user.phone,
        }))
      );
      dataMap.set("brands", brands.data);
      dataMap.set("deviceTypes", deviceTypes.data);
      setRelatedData(dataMap);
    } catch (err) {
      console.error("Failed to fetch related data for update page:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (
    data: z.infer<typeof createReceivedDeviceSchema>
  ) => {
    try {
      await update(id, data);
      router.push("/dashboard/received-devices");
    } catch (error) {
      console.error("Error updating received device:", error);
    }
  };

  if (isLoading || (dataLoading && !defaultValues)) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <div className="space-y-6">
      <DynamicUpdateWrapper
        title="ویرایش دستگاه دریافتی"
        backUrl="/dashboard/received-devices"
        formConfig={formConfig}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        entityId={id}
        isLoading={submitting}
        error={error}
        success={success}
      />
    </div>
  );
}

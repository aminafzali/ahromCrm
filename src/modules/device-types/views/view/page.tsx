// src/modules/device-types/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DetailWrapper from "@/@Client/Components/wrappers/DetailWrapper/Index";
import { useDeviceType } from "@/modules/device-types/hooks/useDeviceType";
import { DeviceTypeWithRelations } from "@/modules/device-types/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 1. تعریف پراپ‌ها، دقیقا مشابه الگوی ProductDetailsViewProps
interface DeviceTypeDetailsViewProps {
  id: number;
}

// این کامپوننت توسط /dashboard/device-types/[id] رندر می‌شود
export default function DetailPage({ id }: DeviceTypeDetailsViewProps) {
  const router = useRouter();

  // 2. واکشی متدها از هوک
  const { getById, loading, statusCode, remove } = useDeviceType();

  // 3. تعریف state محلی برای نگهداری داده
  const [deviceType, setDeviceType] = useState<DeviceTypeWithRelations | null>(null);

  // 4. واکشی داده در زمان بارگذاری، با استفاده از id عددی که از props آمده
  useEffect(() => {
    if (id) {
      fetchDeviceType();
    }
  }, [id]);

  const fetchDeviceType = async () => {
    try {
      const data = await getById(id); // 'id' اینجا از قبل یک عدد است
      setDeviceType(data);
    } catch (error) {
      console.error("Error fetching device type:", error);
    }
  };

  // 5. تعریف تابع برای مدیریت حذف، دقیقا مشابه الگو
  const handleDelete = async () => {
    if (!deviceType) return;
    try {
      await remove(deviceType.id);
      router.push("/dashboard/device-types");
    } catch (error) {
      console.error("Error deleting device type:", error);
    }
  };

  // مدیریت وضعیت‌های loading و not found
  if (loading && !deviceType) return <Loading />;
  if (statusCode === 404) return <NotFound />;
  if (!deviceType) return <Loading />; // نمایش لودینگ تا زمانی که داده دریافت نشده

  return (
    // 6. استفاده از DetailWrapper با پراپ‌های صحیح، مشابه الگوی محصول
    <DetailWrapper
      data={deviceType}
      title="جزئیات نوع دستگاه"
      loading={loading}
      excludeFields={["id", "createdAt", "updatedAt", "_count"]}
      onDelete={handleDelete}
      editUrl={`/dashboard/device-types/${id}/update`}
    />
  );
}
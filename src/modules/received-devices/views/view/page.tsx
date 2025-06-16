// src/modules/received-devices/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay"; // 1. اصلاح import
import DetailWrapper from "@/@Client/Components/wrappers/DetailWrapper/Index";
import { useReceivedDevice } from "@/modules/received-devices/hooks/useReceivedDevice";
import { ReceivedDeviceWithRelations } from "@/modules/received-devices/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DetailsPageProps {
  id: number;
}

export default function DetailPage({ id }: DetailsPageProps) {
  const router = useRouter();
  const { getById, loading, statusCode, remove } = useReceivedDevice();
  const [item, setItem] = useState<ReceivedDeviceWithRelations | null>(null);

  useEffect(() => {
    if (id && !isNaN(id)) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      setItem(await getById(id));
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    await remove(item.id);
    router.push("/dashboard/received-devices");
  };

  if (loading && !item) return <Loading />;
  if (statusCode === 404) return <NotFound />;
  if (!item) return <Loading />; // یا نمایش پیام "موردی یافت نشد"

  // 2. تعریف یک آبجکت برای رندرهای سفارشی، دقیقا مشابه الگوی products
  const customRenderers = {
    user: (value: any) => value?.name || value?.phone || '-',
    brand: (value: any) => value?.name || '-',
    deviceType: (value: any) => value?.name || '-',
    request: (value: any) => value ? `#${value.trackingCode}` : 'ثبت بدون درخواست',
    receivedDate: (value: any) => <DateDisplay date={value} />,
    // می‌توان برای status هم یک رندر سفارشی نوشت اگر نیاز باشد
    status: (value: any) => <StatusBadge status={value?.name} />,
  };
  
  // 3. آماده‌سازی داده برای نمایش، با اضافه کردن فیلد status از داخل request
  const displayData = {
    ...item,
    status: item.request?.status, // اضافه کردن status به سطح اول آبجکت برای نمایش
  };

  return (
    <DetailWrapper
      data={displayData}
      title={`جزئیات دستگاه: ${item.deviceType?.name} ${item.brand?.name}`}
      loading={loading}
      onDelete={handleDelete}
      editUrl={`/dashboard/received-devices/${id}/update`}
      // 4. استفاده از پراپ‌های صحیح excludeFields و customRenderers
      excludeFields={["id", "createdAt", "updatedAt", "userId", "brandId", "deviceTypeId", "requestId"]}
      customRenderers={customRenderers}
    />
  );
}
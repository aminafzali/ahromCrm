// // src/modules/received-devices/views/view/page.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import DetailWrapper from "@/@Client/Components/wrappers/DetailWrapper/Index";
import { ActionButton } from "@/@Client/types";
import { useReceivedDevice } from "@/modules/received-devices/hooks/useReceivedDevice";
import { ReceivedDeviceWithRelations } from "@/modules/received-devices/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface DetailsPageProps {
  id: number;
}

export default function DetailPage({ id }: DetailsPageProps) {
  const router = useRouter();
  const { getById, loading, statusCode, remove, update, submitting } =
    useReceivedDevice();
  const [item, setItem] = useState<ReceivedDeviceWithRelations | null>(null);

  useEffect(() => {
    if (id && !isNaN(id)) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const data = await getById(id);
      if (data != undefined) setItem(data);
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    await remove(item.id);
    router.push("/dashboard/received-devices");
  };

  /**
   * Handles toggling the delivery status of the device.
   */
  const handleToggleDelivery = async () => {
    if (!item) return;
    const newStatus = !item.isDelivered;
    try {
      // FIX 1: Removed the type casting. The schema change will fix the type error.
      await update(item.id, { isDelivered: newStatus });

      toast.success("وضعیت تحویل با موفقیت تغییر کرد.");
      fetchItem(); // Re-fetch data to update the UI
    } catch (error) {
      toast.error("خطا در تغییر وضعیت تحویل.");
      console.error("Failed to update delivery status:", error);
    }
  };

  /**
   * Generates action buttons for the detail view header.
   * @returns An array of ActionButton objects.
   */
  const getActionButtons = (): ActionButton[] => {
    if (!item) return [];
    return [
      {
        label: item.isDelivered ? "تغییر به تحویل نشده" : "تغییر به تحویل شده",
        onClick: handleToggleDelivery,
        icon: (
          <DIcon
            icon={item.isDelivered ? "fa-times" : "fa-check"}
            cdi={false}
            classCustom="ml-2"
          />
        ),
        variant: "primary",
        // FIX 2: Removed the 'loading' property as it doesn't exist on ActionButton type.
        // The button will be disabled automatically by the DetailWrapper's main loading state.
      },
    ];
  };

  if (loading && !item) return <Loading />;
  if (statusCode === 404) return <NotFound />;
  if (!item) return <Loading />; // Or show a "Not Found" message

  const customRenderers = {
    workspaceUser: (value: any) =>
      value?.displayName || value?.name || value?.phone || "-",
    brand: (value: any) => value?.name || "-",
    deviceType: (value: any) => value?.name || "-",
    request: (value: any) =>
      value ? `#${value.trackingCode}` : "ثبت بدون درخواست",
    receivedDate: (value: any) => <DateDisplay date={value} />,
    status: (value: any) => <StatusBadge status={value?.name} />,
    /**
     * Custom renderer for the isDelivered boolean field.
     */
    isDelivered: (value: boolean) =>
      value ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          تحویل شده
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          تحویل نشده
        </span>
      ),
  };

  // Prepare data for display, adding the status from the related request
  const displayData = {
    ...item,
    status: item.request?.status,
  };

  return (
    <DetailWrapper
      data={displayData}
      title={`جزئیات دستگاه: ${item.deviceType?.name} ${item.brand?.name}`}
      loading={loading || submitting} // Show loading during fetch or update
      onDelete={handleDelete}
      editUrl={`/dashboard/received-devices/${id}/update`}
      actionButtons={getActionButtons()} // Pass the action buttons
      excludeFields={[
        "id",
        "createdAt",
        "updatedAt",
        "workspaceUserId",
        "brandId",
        "deviceTypeId",
        "requestId",
      ]}
      customRenderers={customRenderers}
    />
  );
}

// "use client";

// import Loading from "@/@Client/Components/common/Loading";
// import NotFound from "@/@Client/Components/common/NotFound";
// import StatusBadge from "@/@Client/Components/common/StatusBadge";
// import DateDisplay from "@/@Client/Components/DateTime/DateDisplay"; // 1. اصلاح import
// import DetailWrapper from "@/@Client/Components/wrappers/DetailWrapper/Index";
// import { useReceivedDevice } from "@/modules/received-devices/hooks/useReceivedDevice";
// import { ReceivedDeviceWithRelations } from "@/modules/received-devices/types";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// interface DetailsPageProps {
//   id: number;
// }

// export default function DetailPage({ id }: DetailsPageProps) {
//   const router = useRouter();
//   const { getById, loading, statusCode, remove } = useReceivedDevice();
//   const [item, setItem] = useState<ReceivedDeviceWithRelations | null>(null);

//   useEffect(() => {
//     if (id && !isNaN(id)) {
//       fetchItem();
//     }
//   }, [id]);

//   const fetchItem = async () => {
//     try {
//       const data = await getById(id);
//       if (data != undefined) setItem(data);
//     } catch (error) {
//       console.error("Error fetching item details:", error);
//     }
//   };

//   const handleDelete = async () => {
//     if (!item) return;
//     await remove(item.id);
//     router.push("/dashboard/received-devices");
//   };

//   if (loading && !item) return <Loading />;
//   if (statusCode === 404) return <NotFound />;
//   if (!item) return <Loading />; // یا نمایش پیام "موردی یافت نشد"

//   // 2. تعریف یک آبجکت برای رندرهای سفارشی، دقیقا مشابه الگوی products
//   const customRenderers = {
//     workspaceUser: (value: any) =>
//       value?.displayName || value?.name || value?.phone || "-",
//     brand: (value: any) => value?.name || "-",
//     deviceType: (value: any) => value?.name || "-",
//     request: (value: any) =>
//       value ? `#${value.trackingCode}` : "ثبت بدون درخواست",
//     receivedDate: (value: any) => <DateDisplay date={value} />,
//     // می‌توان برای status هم یک رندر سفارشی نوشت اگر نیاز باشد
//     status: (value: any) => <StatusBadge status={value?.name} />,
//   };

//   // 3. آماده‌سازی داده برای نمایش، با اضافه کردن فیلد status از داخل request
//   const displayData = {
//     ...item,
//     status: item.request?.status, // اضافه کردن status به سطح اول آبجکت برای نمایش
//   };

//   return (
//     <DetailWrapper
//       data={displayData}
//       title={`جزئیات دستگاه: ${item.deviceType?.name} ${item.brand?.name}`}
//       loading={loading}
//       onDelete={handleDelete}
//       editUrl={`/dashboard/received-devices/${id}/update`}
//       // 4. استفاده از پراپ‌های صحیح excludeFields و customRenderers
//       excludeFields={[
//         "id",
//         "createdAt",
//         "updatedAt",
//         "workspaceUserId",
//         "brandId",
//         "deviceTypeId",
//         "requestId",
//       ]}
//       customRenderers={customRenderers}
//     />
//   );
// }

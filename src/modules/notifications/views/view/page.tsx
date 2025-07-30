// مسیر فایل: src/modules/notifications/views/[id]/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useNotification } from "../../hooks/useNotification";
import { NotificationWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { getById, loading, error, success, statusCode, remove } =
    useNotification();
  const [notification, setNotification] =
    useState<NotificationWithRelations | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchNotificationDetails();
    }
  }, [id]);

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/notifications");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const fetchNotificationDetails = async () => {
    try {
      const data = await getById(id);
      if (data) setNotification(data);
    } catch (error) {
      console.error("Error fetching notification details:", error);
    }
  };

  const displayData = notification
    ? {
        "ارسال شده به":
          notification.workspaceUser?.displayName ||
          notification.workspaceUser?.user?.name,
        عنوان: notification.title,
        "متن پیام": notification.message,
        وضعیت: notification.isRead ? "خوانده شده" : "خوانده نشده",
        "ارسال پیامک": notification.sendSms ? "بله" : "خیر",
        "تاریخ ارسال": new Date(notification.createdAt).toLocaleString("fa-IR"),
      }
    : {};

  const customRenderers = {
    "درخواست مرتبط": (value: any) =>
      notification?.request ? (
        <Link
          href={`/dashboard/requests/${notification.request.id}`}
          className="text-blue-500 hover:underline"
        >
          مشاهده درخواست #{notification.request.id}
        </Link>
      ) : (
        "ندارد"
      ),
  };

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات اطلاع‌رسانی"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(notification)}
      // معمولا نوتیفیکیشن‌ها ویرایش نمی‌شوند
      // editUrl={`/dashboard/notifications/${id}/update`}
    />
  );
}

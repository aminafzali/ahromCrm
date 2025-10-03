"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useReminder } from "../../hooks/useReminder";
import { ReminderWithDetails } from "../../types";

export default function ReminderDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { getById, loading, error, success, statusCode, remove } =
    useReminder();
  const [reminder, setReminder] = useState<ReminderWithDetails | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchReminderDetails();
    }
  }, [id]);

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/reminders");
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const fetchReminderDetails = async () => {
    try {
      const data = await getById(id);
      if (data) setReminder(data);
    } catch (error) {
      console.error("Error fetching reminder details:", error);
    }
  };

  const displayData = reminder
    ? {
        "برای کاربر":
          reminder.workspaceUser?.displayName ||
          reminder.workspaceUser?.user?.name ||
          reminder.workspaceUser?.phone,
        عنوان: reminder.title,
        توضیحات: reminder.description || "ندارد",
        "تاریخ یادآوری": new Date(reminder.dueDate).toLocaleString("fa-IR"),
        وضعیت:
          {
            PENDING: "در انتظار",
            COMPLETED: "ارسال شده",
            CANCELLED: "لغو شده",
            FAILED: "ناموفق",
          }[reminder.status] || reminder.status,
        "کانال اعلان":
          {
            ALL: "همه",
            IN_APP: "داخلی",
            SMS: "پیامک",
            EMAIL: "ایمیل",
          }[reminder.notificationChannels] || reminder.notificationChannels,
        "تاریخ ایجاد": new Date(reminder.createdAt).toLocaleString("fa-IR"),
        "درخواست مرتبط": reminder.request
          ? `درخواست #${reminder.request.id}`
          : "ندارد",
        "فاکتور مرتبط": reminder.invoice
          ? `فاکتور #${reminder.invoice.id}`
          : "ندارد",
        "پرداخت مرتبط": reminder.payment
          ? `پرداخت #${reminder.payment.id}`
          : "ندارد",
      }
    : {};

  const customRenderers = {
    "درخواست مرتبط": (value: any) =>
      reminder?.request ? (
        <Link
          href={`/dashboard/requests/${reminder.request.id}`}
          className="text-blue-500 hover:underline"
        >
          مشاهده درخواست #{reminder.request.id}
        </Link>
      ) : (
        "ندارد"
      ),
    "فاکتور مرتبط": (value: any) =>
      reminder?.invoice ? (
        <Link
          href={`/dashboard/invoices/${reminder.invoice.id}`}
          className="text-blue-500 hover:underline"
        >
          مشاهده فاکتور #{reminder.invoice.id}
        </Link>
      ) : (
        "ندارد"
      ),
    "پرداخت مرتبط": (value: any) =>
      reminder?.payment ? (
        <Link
          href={`/dashboard/payments/${reminder.payment.id}`}
          className="text-blue-500 hover:underline"
        >
          مشاهده پرداخت #{reminder.payment.id}
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
      title="جزئیات یادآوری"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(reminder)}
      customRenderers={customRenderers}
      // ریمایندرها معمولاً ویرایش نمی‌شوند
      // editUrl={`/dashboard/reminders/${id}/update`}
    />
  );
}

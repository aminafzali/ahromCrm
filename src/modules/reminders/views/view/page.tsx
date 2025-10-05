"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
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
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchReminderDetails();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!reminder) return;

    try {
      await remove(reminder.id);
      router.push("/dashboard/reminders");
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const handleToggleActive = async () => {
    if (!reminder) return;

    try {
      setUpdating(true);
      // استفاده از API مستقیم برای به‌روزرسانی فقط isActive
      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Workspace-Id": (reminder as any)?.workspaceId?.toString() || "",
        },
        body: JSON.stringify({
          isActive: !reminder.isActive,
        }),
      });

      if (response.ok) {
        // به‌روزرسانی اطلاعات یادآور
        await fetchReminderDetails();
      } else {
        console.error("Failed to update reminder status");
      }
    } catch (error) {
      console.error("Error toggling reminder status:", error);
    } finally {
      setUpdating(false);
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

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              جزئیات یادآوری
            </h1>
            <div className="text-sm text-gray-600">
              شناسه: <span className="font-mono text-teal-700">#{id}</span>
            </div>
          </div>
          <Link
            href="/dashboard/reminders"
            className="btn btn-ghost text-teal-700 hover:bg-teal-50"
          >
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            بازگشت
          </Link>
        </div>
      </div>

      {/* دکمه‌های عملیات - الگوی مشابه کارت وضعیت‌ها */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex flex-row flex-wrap items-center gap-2 border-t-2 pt-4">
          <button
            onClick={handleToggleActive}
            disabled={updating}
            className={`btn btn-ghost ${
              reminder?.isActive ? "text-rose-700" : "text-green-700"
            }`}
          >
            {updating ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <DIcon
                icon={reminder?.isActive ? "fa-pause" : "fa-play"}
                cdi={false}
                classCustom="ml-2"
              />
            )}
            <span>{reminder?.isActive ? "غیرفعال کردن" : "فعال کردن"}</span>
          </button>

          <Link
            href={`/dashboard/reminders/${id}/edit`}
            className="btn btn-ghost text-gray-900"
          >
            <DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />
            <span>ویرایش</span>
          </Link>

          <button
            onClick={handleDelete}
            className="btn btn-ghost text-rose-700"
          >
            <DIcon icon="fa-trash" cdi={false} classCustom="ml-2" />
            <span>حذف</span>
          </button>

          {reminder?.groupName && (
            <Link
              href={`/dashboard/reminders/grouped/${reminder.reminderNumber}`}
              className="btn btn-ghost text-gray-900"
            >
              <DIcon icon="fa-users" cdi={false} classCustom="ml-2" />
              <span>مشاهده گروه</span>
            </Link>
          )}
        </div>
      </div>

      {/* اطلاعات اصلی */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DIcon
            icon="fa-info-circle"
            cdi={false}
            classCustom="ml-2 text-teal-700"
          />
          اطلاعات اصلی
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">عنوان</div>
              <div className="font-medium text-gray-900">{reminder?.title}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">توضیحات</div>
              <div className="font-medium text-gray-900">
                {reminder?.description || "ندارد"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">شماره یادآور</div>
              <div className="font-mono text-teal-700">
                {reminder?.reminderNumber || "ندارد"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">نام گروه</div>
              <div className="font-medium text-gray-900">
                {reminder?.groupName || "فردی"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">کاربر</div>
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-teal-100 text-teal-700 w-10 rounded-full">
                    <span className="text-sm font-medium">
                      {(
                        reminder?.workspaceUser?.displayName ||
                        reminder?.workspaceUser?.user?.name ||
                        "نامشخص"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {reminder?.workspaceUser?.displayName ||
                      reminder?.workspaceUser?.user?.name ||
                      "نامشخص"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reminder?.workspaceUser?.user?.phone ||
                      "شماره تلفن موجود نیست"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">تاریخ یادآوری</div>
              <div className="font-medium text-gray-900">
                {reminder?.dueDate
                  ? new Date(reminder.dueDate).toLocaleString("fa-IR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "ندارد"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">وضعیت</div>
              <div>
                <span
                  className={`badge ${
                    reminder?.status === "PENDING"
                      ? "badge-warning"
                      : reminder?.status === "COMPLETED"
                      ? "badge-success"
                      : "badge-error"
                  }`}
                >
                  {reminder?.status === "PENDING"
                    ? "در انتظار"
                    : reminder?.status === "COMPLETED"
                    ? "تکمیل شده"
                    : "لغو شده"}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">وضعیت فعال</div>
              <div>
                <span
                  className={`badge ${
                    reminder?.isActive ? "badge-success" : "badge-error"
                  }`}
                >
                  {reminder?.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* اطلاعات تکمیلی */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DIcon icon="fa-cog" cdi={false} classCustom="ml-2 text-teal-700" />
          اطلاعات تکمیلی
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">کانال اعلان</div>
              <div className="font-medium text-gray-900">
                {reminder?.notificationChannels === "ALL"
                  ? "همه"
                  : reminder?.notificationChannels === "IN_APP"
                  ? "داخلی"
                  : reminder?.notificationChannels === "SMS"
                  ? "پیامک"
                  : reminder?.notificationChannels === "EMAIL"
                  ? "ایمیل"
                  : reminder?.notificationChannels || "ندارد"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">تاریخ ایجاد</div>
              <div className="font-medium text-gray-900">
                {reminder?.createdAt
                  ? new Date(reminder.createdAt).toLocaleString("fa-IR")
                  : "ندارد"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {reminder?.request && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">درخواست مرتبط</div>
                <Link
                  href={`/dashboard/requests/${reminder.request.id}`}
                  className="text-teal-700 hover:underline font-medium"
                >
                  مشاهده درخواست #{reminder.request.id}
                </Link>
              </div>
            )}

            {reminder?.invoice && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">فاکتور مرتبط</div>
                <Link
                  href={`/dashboard/invoices/${reminder.invoice.id}`}
                  className="text-teal-700 hover:underline font-medium"
                >
                  مشاهده فاکتور #{reminder.invoice.id}
                </Link>
              </div>
            )}

            {reminder?.payment && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">پرداخت مرتبط</div>
                <Link
                  href={`/dashboard/payments/${reminder.payment.id}`}
                  className="text-teal-700 hover:underline font-medium"
                >
                  مشاهده پرداخت #{reminder.payment.id}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

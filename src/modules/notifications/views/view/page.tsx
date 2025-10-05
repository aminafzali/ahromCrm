"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useNotification } from "../../hooks/useNotification";
import { NotificationWithRelations } from "../../types";

export default function NotificationDetailPage() {
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

  const handleDelete = async () => {
    if (!notification) return;

    try {
      await remove(notification.id);
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

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              جزئیات اعلان
            </h1>
            <div className="text-sm text-gray-600">
              شناسه: <span className="font-mono text-teal-700">#{id}</span>
            </div>
          </div>
          <Link
            href="/dashboard/notifications"
            className="btn btn-ghost text-teal-700 hover:bg-teal-50"
          >
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            بازگشت
          </Link>
        </div>
      </div>

      {/* دکمه‌های عملیات */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex flex-row flex-wrap items-center gap-2 border-t-2 pt-4">
          <button
            onClick={handleDelete}
            className="btn btn-ghost text-rose-700"
          >
            <DIcon icon="fa-trash" cdi={false} classCustom="ml-2" />
            <span>حذف</span>
          </button>

          {notification?.groupName && (
            <Link
              href={`/dashboard/notifications/grouped/${notification.notificationNumber}`}
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
              <div className="font-medium text-gray-900">
                {notification?.title}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">پیام</div>
              <div className="font-medium text-gray-900">
                {notification?.message || "ندارد"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">شماره اعلان</div>
              <div className="font-mono text-teal-700">
                {notification?.notificationNumber || "ندارد"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">نام گروه</div>
              <div className="font-medium text-gray-900">
                {notification?.groupName || "فردی"}
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
                        notification?.workspaceUser?.displayName ||
                        notification?.workspaceUser?.user?.name ||
                        "نامشخص"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {notification?.workspaceUser?.displayName ||
                      notification?.workspaceUser?.user?.name ||
                      "نامشخص"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {notification?.workspaceUser?.user?.phone ||
                      "شماره تلفن موجود نیست"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">تاریخ ارسال</div>
              <div className="font-medium text-gray-900">
                {notification?.createdAt
                  ? new Date(notification.createdAt).toLocaleString("fa-IR", {
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
              <div className="text-sm text-gray-600 mb-1">وضعیت خواندن</div>
              <div>
                <span
                  className={`badge ${
                    notification?.isRead ? "badge-success" : "badge-warning"
                  }`}
                >
                  {notification?.isRead ? "خوانده شده" : "خوانده نشده"}
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
              <div className="text-sm text-gray-600 mb-1">ارسال پیامک</div>
              <div className="font-medium text-gray-900">
                {notification?.sendSms ? "بله" : "خیر"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">ارسال ایمیل</div>
              <div className="font-medium text-gray-900">
                {notification?.sendEmail ? "بله" : "خیر"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {notification?.request && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">درخواست مرتبط</div>
                <Link
                  href={`/dashboard/requests/${notification.request.id}`}
                  className="text-teal-700 hover:underline font-medium"
                >
                  مشاهده درخواست #{notification.request.id}
                </Link>
              </div>
            )}

            {notification?.invoice && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">فاکتور مرتبط</div>
                <Link
                  href={`/dashboard/invoices/${notification.invoice.id}`}
                  className="text-teal-700 hover:underline font-medium"
                >
                  مشاهده فاکتور #{notification.invoice.id}
                </Link>
              </div>
            )}

            {notification?.reminder && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">یادآوری مرتبط</div>
                <Link
                  href={`/dashboard/reminders/${notification.reminder.id}`}
                  className="text-teal-700 hover:underline font-medium"
                >
                  مشاهده یادآوری #{notification.reminder.id}
                </Link>
              </div>
            )}

            {notification?.payment && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">پرداخت مرتبط</div>
                <Link
                  href={`/dashboard/payments/${notification.payment.id}`}
                  className="text-teal-700 hover:underline font-medium"
                >
                  مشاهده پرداخت #{notification.payment.id}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

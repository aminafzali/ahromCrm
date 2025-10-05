"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useNotification } from "@/modules/notifications/hooks/useNotification";
import Link from "next/link";
import { useEffect, useState } from "react";

interface GroupedNotificationDetailsPageProps {
  params: {
    groupNumber: string;
  };
  isAdmin?: boolean;
}

export default function GroupedNotificationDetailsPage({
  params,
  isAdmin = false,
}: GroupedNotificationDetailsPageProps) {
  const { groupNumber } = params;
  const { getGroupedNotifications } = useNotification();
  const { activeWorkspace } = useWorkspace();
  const [groupedData, setGroupedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchGroupedData = async () => {
    try {
      setLoading(true);
      const result = await getGroupedNotifications({
        page: 1,
        limit: 1000,
        filters: {
          notificationNumber: groupNumber,
        },
      });

      // پیدا کردن گروه مربوط به این شماره
      const group = result.data.find(
        (item: any) => item.notificationNumber === groupNumber
      );

      if (group) {
        setGroupedData(group);
      } else {
        setError("گروه اعلان یافت نشد");
      }
    } catch (err) {
      console.error("Error fetching grouped data:", err);
      setError("خطا در دریافت اطلاعات گروه");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupNumber && activeWorkspace?.id) {
      fetchGroupedData();
    }
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <DIcon icon="fa-exclamation-triangle" cdi={false} classCustom="ml-2" />
        {error}
      </div>
    );
  }

  if (!groupedData) {
    return (
      <div className="alert alert-warning">
        <DIcon icon="fa-info-circle" cdi={false} classCustom="ml-2" />
        گروه اعلان یافت نشد
      </div>
    );
  }

  // ستون‌های مخصوص نمایش جزئیات گروه
  const groupDetailColumns = [
    {
      name: "workspaceUser",
      field: "workspaceUser.displayName",
      label: "کاربر",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-teal-100 text-teal-700 w-10 rounded-full">
              <span className="text-sm font-medium">
                {(
                  row.workspaceUser?.displayName ||
                  row.workspaceUser?.user?.name ||
                  "نامشخص"
                )
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.workspaceUser?.displayName ||
                row.workspaceUser?.user?.name ||
                "نامشخص"}
            </div>
            <div className="text-sm text-gray-500">
              {row.workspaceUser?.user?.phone || "شماره تلفن موجود نیست"}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "title",
      field: "title",
      label: "عنوان",
      render: (row: any) => (
        <div className="font-medium text-gray-900">{row.title}</div>
      ),
    },
    {
      name: "message",
      field: "message",
      label: "پیام",
      render: (row: any) => (
        <div className="text-sm text-gray-700 max-w-xs truncate">
          {row.message || "ندارد"}
        </div>
      ),
    },
    {
      name: "createdAt",
      field: "createdAt",
      label: "زمان ارسال",
      render: (row: any) => (
        <div className="text-sm text-gray-800">
          <span>{new Date(row.createdAt).toLocaleDateString("fa-IR")}</span>
          <span className="mx-1">-</span>
          <span>{new Date(row.createdAt).toLocaleTimeString("fa-IR")}</span>
        </div>
      ),
    },
    {
      name: "status",
      field: "status",
      label: "وضعیت",
      render: (row: any) => (
        <span
          className={`badge ${
            row.status === "PENDING"
              ? "badge-warning"
              : row.status === "SENT"
              ? "badge-success"
              : "badge-error"
          }`}
        >
          {row.status === "PENDING"
            ? "در انتظار"
            : row.status === "SENT"
            ? "ارسال شده"
            : "ناموفق"}
        </span>
      ),
    },
    {
      name: "actions",
      label: "",
      render: (row: any) => (
        <div className="flex flex-row flex-wrap items-center gap-2 border-t-2 pt-2 justify-center">
          <button
            className="btn btn-sm btn-ghost text-gray-900"
            onClick={() =>
              window.open(`/dashboard/notifications/${row.id}`, "_blank")
            }
          >
            <DIcon icon="fa-eye" cdi={false} classCustom="ml-1" />
            <span>مشاهده</span>
          </button>
          <button
            className="btn btn-sm btn-ghost text-gray-900"
            onClick={() =>
              window.open(`/dashboard/notifications/${row.id}/edit`, "_blank")
            }
          >
            <DIcon icon="fa-edit" cdi={false} classCustom="ml-1" />
            <span>ویرایش</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              جزئیات گروه اعلان
            </h1>
            <div className="text-sm text-gray-600">
              شماره:{" "}
              <span className="font-mono text-teal-700">{groupNumber}</span>
            </div>
          </div>
          <Link
            href={isAdmin ? "/dashboard/notifications" : "/panel/notifications"}
            className="btn btn-ghost text-teal-700 hover:bg-teal-50"
          >
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            بازگشت
          </Link>
        </div>
      </div>

      {/* اطلاعات گروه */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DIcon
            icon="fa-info-circle"
            cdi={false}
            classCustom="ml-2 text-teal-700"
          />
          اطلاعات کلی
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">عنوان اعلان</div>
            <div className="font-medium text-gray-900">{groupedData.title}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">نام گروه</div>
            <div className="font-medium text-gray-900">
              {groupedData.groupName}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">نوع موجودیت</div>
            <div className="font-medium text-gray-900">
              {groupedData.entityType || "عمومی"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">تاریخ ارسال</div>
            <div className="font-medium text-gray-900">
              {new Date(groupedData.createdAt).toLocaleDateString("fa-IR")}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">وضعیت کلی</div>
            <div>
              <span
                className={`badge ${
                  groupedData.status === "PENDING"
                    ? "badge-warning"
                    : groupedData.status === "SENT"
                    ? "badge-success"
                    : "badge-error"
                }`}
              >
                {groupedData.status === "PENDING"
                  ? "در انتظار"
                  : groupedData.status === "SENT"
                  ? "ارسال شده"
                  : "ناموفق"}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">تعداد گیرندگان</div>
            <div className="font-medium text-gray-900">
              {groupedData.userCount || 0} نفر
            </div>
          </div>
        </div>
      </div>

      {/* جدول اعلان‌های گروه */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="p-6 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <DIcon
              icon="fa-users"
              cdi={false}
              classCustom="ml-2 text-teal-700"
            />
            لیست گیرندگان
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <DataTableWrapper
            title=""
            columns={groupDetailColumns}
            loading={loading}
            error={error}
            fetcher={async () => {
              return {
                data: groupedData.notifications || [],
                pagination: {
                  total: groupedData.notifications?.length || 0,
                  pages: 1,
                  page: 1,
                  limit: 1000,
                },
              };
            }}
            filterOptions={[]}
            dateFilterFields={[]}
            createUrl=""
          />
        </div>
      </div>
    </div>
  );
}

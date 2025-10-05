"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useReminder } from "@/modules/reminders/hooks/useReminder";
import Link from "next/link";
import { useEffect, useState } from "react";

interface GroupedReminderDetailsPageProps {
  params: {
    groupNumber: string;
  };
  isAdmin?: boolean;
}

export default function GroupedReminderDetailsPage({
  params,
  isAdmin = false,
}: GroupedReminderDetailsPageProps) {
  const { groupNumber } = params;
  const { getGroupedReminders } = useReminder();
  const { activeWorkspace } = useWorkspace();
  const [groupedData, setGroupedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchGroupedData = async () => {
    try {
      setLoading(true);
      const result = await getGroupedReminders({
        page: 1,
        limit: 1000,
        filters: {
          reminderNumber: groupNumber,
        },
      });

      // پیدا کردن گروه مربوط به این شماره
      const group = result.data.find(
        (item: any) => item.reminderNumber === groupNumber
      );

      if (group) {
        setGroupedData(group);
      } else {
        setError("گروه یادآور یافت نشد");
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

  const handleToggleActive = async (
    reminderId: number,
    currentStatus: boolean
  ) => {
    try {
      setUpdating(reminderId);
      // استفاده از API مستقیم برای به‌روزرسانی فقط isActive
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Workspace-Id": activeWorkspace?.id?.toString() || "",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        // Refresh data after update
        await fetchGroupedData();
      } else {
        console.error("Failed to update reminder status");
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleAllActive = async (activate: boolean) => {
    if (!groupedData?.reminders) return;

    try {
      setUpdating(-1); // Special ID for "all"
      const promises = groupedData.reminders.map((reminder: any) =>
        fetch(`/api/reminders/${reminder.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Workspace-Id": activeWorkspace?.id?.toString() || "",
          },
          body: JSON.stringify({
            isActive: activate,
          }),
        })
      );
      await Promise.all(promises);
      // Refresh data after update
      await fetchGroupedData();
    } catch (error) {
      console.error("Error updating all reminders:", error);
    } finally {
      setUpdating(null);
    }
  };

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
        گروه یادآور یافت نشد
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
      name: "dueDate",
      field: "dueDate",
      label: "زمان ارسال",
      render: (row: any) => (
        <div className="text-sm text-gray-800">
          <span>{new Date(row.dueDate).toLocaleDateString("fa-IR")}</span>
          <span className="mx-1">-</span>
          <span>{new Date(row.dueDate).toLocaleTimeString("fa-IR")}</span>
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
              : row.status === "COMPLETED"
              ? "badge-success"
              : "badge-error"
          }`}
        >
          {row.status === "PENDING"
            ? "در انتظار"
            : row.status === "COMPLETED"
            ? "تکمیل شده"
            : "لغو شده"}
        </span>
      ),
    },
    {
      name: "isActive",
      field: "isActive",
      label: "وضعیت فعال",
      render: (row: any) => (
        <span
          className={`badge ${row.isActive ? "badge-success" : "badge-error"}`}
        >
          {row.isActive ? "فعال" : "غیرفعال"}
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
              window.open(`/dashboard/reminders/${row.id}`, "_blank")
            }
          >
            <DIcon icon="fa-eye" cdi={false} classCustom="ml-1" />
            <span>مشاهده</span>
          </button>
          <button
            className="btn btn-sm btn-ghost text-gray-900"
            onClick={() =>
              window.open(`/dashboard/reminders/${row.id}/edit`, "_blank")
            }
          >
            <DIcon icon="fa-edit" cdi={false} classCustom="ml-1" />
            <span>ویرایش</span>
          </button>
          <button
            className={`btn btn-sm btn-ghost ${
              row.isActive ? "text-rose-700" : "text-green-700"
            }`}
            onClick={() => handleToggleActive(row.id, row.isActive)}
            disabled={updating === row.id}
          >
            {updating === row.id ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <DIcon
                icon={row.isActive ? "fa-pause" : "fa-play"}
                cdi={false}
                classCustom="ml-1"
              />
            )}
            <span>{row.isActive ? "غیرفعال" : "فعال"}</span>
          </button>
        </div>
      ),
    },
  ];

  const allActive =
    groupedData.reminders?.every((r: any) => r.isActive) || false;
  const allInactive =
    groupedData.reminders?.every((r: any) => !r.isActive) || false;

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              جزئیات گروه یادآور
            </h1>
            <div className="text-sm text-gray-600">
              شماره:{" "}
              <span className="font-mono text-teal-700">{groupNumber}</span>
            </div>
          </div>
          <Link
            href={isAdmin ? "/dashboard/reminders" : "/panel/reminders"}
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
            <div className="text-sm text-gray-600 mb-1">عنوان یادآور</div>
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
              {new Date(groupedData.dueDate).toLocaleDateString("fa-IR")}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">وضعیت کلی</div>
            <div>
              <span
                className={`badge ${
                  groupedData.status === "PENDING"
                    ? "badge-warning"
                    : groupedData.status === "COMPLETED"
                    ? "badge-success"
                    : "badge-error"
                }`}
              >
                {groupedData.status === "PENDING"
                  ? "در انتظار"
                  : groupedData.status === "COMPLETED"
                  ? "تکمیل شده"
                  : "لغو شده"}
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

      {/* دکمه‌های کنترل کلی */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex flex-row flex-wrap items-center gap-2 border-t-2 pt-4">
          <button
            className={`btn btn-ghost ${
              allActive ? "text-green-700" : "text-green-700"
            }`}
            onClick={() => handleToggleAllActive(true)}
            disabled={updating === -1 || allActive}
          >
            {updating === -1 ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <DIcon icon="fa-play" cdi={false} classCustom="ml-2" />
            )}
            <span>فعال کردن همه</span>
          </button>
          <button
            className={`btn btn-ghost ${
              allInactive ? "text-rose-700" : "text-rose-700"
            }`}
            onClick={() => handleToggleAllActive(false)}
            disabled={updating === -1 || allInactive}
          >
            {updating === -1 ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <DIcon icon="fa-pause" cdi={false} classCustom="ml-2" />
            )}
            <span>غیرفعال کردن همه</span>
          </button>
        </div>
      </div>

      {/* جدول یادآورهای گروه */}
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
                data: groupedData.reminders || [],
                pagination: {
                  total: groupedData.reminders?.length || 0,
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

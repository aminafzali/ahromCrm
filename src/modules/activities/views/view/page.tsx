"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActivity } from "../../hooks/useActivity";

export default function ActivityDetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const router = useRouter();
  const { getById, loading, error, statusCode, remove } = useActivity();
  const [activity, setActivity] = useState<any | null>(null);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    const data = await getById(id);
    if (data) setActivity(data);
  };

  const handleDelete = async () => {
    await remove(id);
    router.push("/dashboard/activities");
  };

  if (!id) return <NotFound />;
  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  const display = activity
    ? {
        عنوان: activity.title,
        وضعیت: activity.status,
        اولویت: activity.priority,
        نوع: activity.type,
        موضوع: activity.subject,
        "نمایش به کاربر": activity.visibleToUser ? "بله" : "خیر",
        "زمان تماس": activity.contactAt
          ? new Date(activity.contactAt).toLocaleString("fa-IR")
          : "-",
        "زمان موعد": activity.dueAt
          ? new Date(activity.dueAt).toLocaleString("fa-IR")
          : "-",
        کاربر: activity.user?.displayName || activity.user?.user?.name || "-",
        "ادمین پیگیر":
          activity.assignedAdmin?.displayName ||
          activity.assignedAdmin?.user?.name ||
          "-",
        تیم: activity.assignedTeam?.name || "-",
        دسته: activity.category?.name || "-",
      }
    : {};

  return (
    <div className="p-2 md:p-4">
      <DetailPageWrapper
        data={display}
        title="جزئیات فعالیت"
        loading={loading}
        error={error}
        onDelete={handleDelete}
        editUrl={`/dashboard/activities/${id}/update`}
      />
    </div>
  );
}

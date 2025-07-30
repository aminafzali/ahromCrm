// مسیر فایل: src/modules/workspace-users/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWorkspaceUser } from "../../hooks/useWorkspaceUser";
import { WorkspaceUserWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { getById, loading, error, success, statusCode, remove } =
    useWorkspaceUser();
  const [member, setMember] = useState<WorkspaceUserWithRelations | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchMemberDetails();
    }
  }, [id]);

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/workspace-users");
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const fetchMemberDetails = async () => {
    try {
      const data = await getById(id);
      if (data) setMember(data);
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  };

  // تبدیل داده‌های تو در تو به یک آبجکت ساده برای نمایش
  const displayData = member
    ? {
        "نام نمایشی": member.displayName || "-",
        "نام واقعی": member.user?.name || "-",
        "شماره تلفن": member.user?.phone || "-",
        نقش: member.role?.name || "-",
        "تاریخ عضویت": new Date(member.createdAt).toLocaleDateString("fa-IR"),
        برچسب‌ها: member.labels?.map((item) => item.name).join(", ") || "ندارد",
        "گروه‌های کاربری":
          member.userGroups?.map((item) => item.name).join(", ") || "ندارد",
      }
    : {};

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات عضو ورک‌اسپیس"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(member)}
      editUrl={`/dashboard/workspace-users/${id}/update`}
    />
  );
}

// مسیر فایل: src/modules/projects/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
// import ChatLinkButton from "@/modules/chat/components/ChatLinkButton"; // Removed: Use internal-chat instead
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProject } from "../../hooks/useProject";
import { ProjectWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const router = useRouter();
  const { getById, loading, error, statusCode, remove } = useProject();
  const [project, setProject] = useState<ProjectWithRelations | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    const data = await getById(id);
    if (data) {
      setProject(data);
    }
  };

  const handleDelete = async (row: any) => {
    await remove(row.id);
    router.push("/dashboard/projects");
  };

  const displayData = project
    ? {
        "نام پروژه": project.name,
        توضیحات: project.description || "-",
        وضعیت: project.status?.name || "-",
        "تعداد وظایف": project._count?.tasks || 0,
        "تاریخ شروع": project.startDate
          ? new Date(project.startDate).toLocaleDateString("fa-IR")
          : "-",
        "تاریخ پایان": project.endDate
          ? new Date(project.endDate).toLocaleDateString("fa-IR")
          : "-",
        "اعضای تخصیص یافته":
          project.assignedUsers
            ?.map((u) => u.displayName || u.user.name)
            .join(", ") || "ندارد",
        "تیم‌های تخصیص یافته":
          project.assignedTeams?.map((t) => t.name).join(", ") || "ندارد",
      }
    : {};

  if (!id) return <NotFound />;
  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <>
      <DetailPageWrapper
        data={displayData}
        title="جزئیات پروژه"
        loading={loading}
        error={error}
        onDelete={() => handleDelete(project)}
        editUrl={`/dashboard/projects/${id}/update`}
      />
      {/* TODO: Add internal-chat link for this project */}
    </>
  );
}

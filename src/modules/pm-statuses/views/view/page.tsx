// مسیر فایل: src/modules/pm-statuses/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePMStatus } from "../../hooks/usePMStatus";
import { PMStatusWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const router = useRouter();
  const { getById, loading, error, statusCode, remove } = usePMStatus();
  const [status, setStatus] = useState<PMStatusWithRelations | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    const data = await getById(id);
    if (data) {
      setStatus(data);
    }
  };

  const handleDelete = async (row: any) => {
    await remove(row.id);
    router.push("/dashboard/pm-statuses");
  };

  const displayData = status
    ? {
        "نام وضعیت": status.name,
        نوع: status.type === "PROJECT" ? "پروژه" : "وظیفه",
        رنگ: (
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: status.color }}
          ></div>
        ),
      }
    : {};

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات وضعیت"
      loading={loading}
      error={error}
      onDelete={() => handleDelete(status)}
      editUrl={`/dashboard/pm-statuses/${id}/update`}
    />
  );
}

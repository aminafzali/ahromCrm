// مسیر فایل: src/modules/permissions/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePermission } from "../../hooks/usePermission";
import { PermissionWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { getById, loading, error, success, statusCode, remove } =
    usePermission();
  const [permission, setPermission] = useState<PermissionWithRelations | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchPermissionDetails();
    }
  }, [id]);

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/permissions");
    } catch (error) {
      console.error("Error deleting permission:", error);
    }
  };

  const fetchPermissionDetails = async () => {
    try {
      const data = await getById(id);
      if (data) setPermission(data);
    } catch (error) {
      console.error("Error fetching permission details:", error);
    }
  };

  const displayData = permission
    ? {
        "عمل (Action)": permission.action,
        ماژول: permission.module,
        توضیحات: permission.description || "-",
      }
    : {};

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات دسترسی"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(permission)}
      editUrl={`/dashboard/permissions/${id}/update`}
    />
  );
}

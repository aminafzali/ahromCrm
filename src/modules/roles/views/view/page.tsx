// مسیر فایل: src/modules/roles/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRole } from "../../hooks/useRole";
import { RoleWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { getById, loading, error, success, statusCode, remove } = useRole();
  const [role, setRole] = useState<RoleWithRelations | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchRoleDetails();
    }
  }, [id]);

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/roles");
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const fetchRoleDetails = async () => {
    try {
      const data = await getById(id);
      if (data) setRole(data);
    } catch (error) {
      console.error("Error fetching role details:", error);
    }
  };

  const displayData = role
    ? {
        "نام نقش": role.name,
        توضیحات: role.description || "-",
      }
    : {};

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات نقش"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(role)}
      editUrl={`/dashboard/roles/${id}/update`}
    />
  );
}

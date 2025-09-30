"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStatus } from "../../hooks/useStatus";
import { Status } from "../../types";

interface StatusDetailsViewProps {
  id: number;
  backUrl: string;
}

export default function DetailPage({ id, backUrl }: StatusDetailsViewProps) {
  const router = useRouter();

  const {
    getById,
    remove,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useStatus();
  const [status, setStatus] = useState<Status>({} as Status);

  useEffect(() => {
    if (id) {
      fetchStatusDetails();
    }
  }, [id]);

  const fetchStatusDetails = async () => {
    try {
      const data = await getById(id);
      if (data != undefined)  setStatus(data);
    } catch (error) {
      console.error("Error fetching status details:", error);
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/statuses");
    } catch (error) {
      console.error("Error deleting status:", error);
    }
  };

  const customRenderers = {
    color: (value: string) => (
      <div className="flex items-center">
        <div
          className="w-6 h-6 rounded-full mr-2"
          style={{ backgroundColor: value }}
        ></div>
        {value}
      </div>
    ),
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={status}
      title="جزئیات وضعیت"
      excludeFields={["id", "updatedAt"]}
      customRenderers={customRenderers}
      loading={loading}
      error={error}
      success={success}
      onDelete={status.isLock ? undefined : handleDelete}
      editUrl={`/dashboard/statuses/${id}/update`}
    />
  );
}

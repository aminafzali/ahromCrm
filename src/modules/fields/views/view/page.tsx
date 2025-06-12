import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { listItemRender as listItemRenderUsers } from "@/modules/users/data/table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useField } from "../../hooks/useField";
import { FieldWithRelations } from "../../types";

interface LabelDetailsViewProps {
  id: number;
  isAdmin: boolean;
  backUrl: string;
}

export default function DetailPage({ id }: LabelDetailsViewProps) {
  const {
    getById,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
    remove,
  } = useField();
  const [label, setLabel] = useState<FieldWithRelations>(
    {} as FieldWithRelations
  );

  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchLabelDetails();
    }
  }, [id]);

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/fields");
    } catch (error) {
      console.error("Error deleting status:", error);
    }
  };

  const fetchLabelDetails = async () => {
    try {
      const data = await getById(id);
      setLabel(data);
    } catch (error) {
      console.error("Error fetching label details:", error);
    }
  };

  const customRenderers = {
    users: (value: []) => (
      <div>
        {value && value.length > 0 && (
          <div className="my-4">
            <h3>کاربران</h3>
            <div className="grid lg:grid-cols-2 gap-2 my-2">
              {value.map((item) => listItemRenderUsers(item))}
            </div>
          </div>
        )}
      </div>
    ),
    color: (value: string) => (
      <div className={`bg-[${value}] w-16 h-6 rounded-lg `}></div>
    ),
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={label}
      title="برچسب"
      excludeFields={["id", "createdAt", "updatedAt", "_count"]}
      loading={loading}
      error={error}
      success={success}
      fieldName="label"
      customRenderers={customRenderers}
      onDelete={handleDelete}
      editUrl={`/dashboard/fields/${id}/update`}
    />
  );
}

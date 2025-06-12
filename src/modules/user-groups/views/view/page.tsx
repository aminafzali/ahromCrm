import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useEffect, useState } from "react";
import { useUserGroup } from "../../hooks/useUserGroup";
import { UserGroupWithRelations } from "../../types";

import { listItemRender as listItemRenderLabel } from "@/modules/labels/data/table";
import { listItemRender as listItemRenderUsers } from "@/modules/users/data/table";
import { useRouter } from "next/navigation";

interface UserGroupDetailsViewProps {
  id: number;
  isAdmin: boolean;
  backUrl: string;
}

export default function DetailPage({ id }: UserGroupDetailsViewProps) {
  const {
    getById,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
    remove,
  } = useUserGroup();
  const [userGroup, setUserGroup] = useState<UserGroupWithRelations>(
    {} as UserGroupWithRelations
  );
  const router = useRouter();

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/user-groups");
    } catch (error) {
      console.error("Error deleting status:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserGroupDetails();
    }
  }, [id]);

  const fetchUserGroupDetails = async () => {
    try {
      const data = await getById(id);
      setUserGroup(data);
    } catch (error) {
      console.error("Error fetching user group details:", error);
    }
  };

  const customRenderers = {
    labels: (value: []) => (
      <div>
        {value && value.length > 0 && (
          <div className="my-4">
            <h3>برچسپ ها</h3>
            <div className="grid lg:grid-cols-3 gap-2 my-2">
              {value.map((item) => listItemRenderLabel(item))}
            </div>
          </div>
        )}
      </div>
    ),
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
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={userGroup}
      title="گروه کاربری"
      excludeFields={["id", "createdAt", "_count"]}
      loading={loading}
      error={error}
      success={success}
      customRenderers={customRenderers}
      onDelete={handleDelete}
      editUrl={`/dashboard/user-groups/${id}/update`}
    />
  );
}

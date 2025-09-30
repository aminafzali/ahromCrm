import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DynamicUpdateWrapper from "@/@Client/Components/wrappers/DynamicUpdateWrapper";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  getUserGroupFormConfig,
  userGroupFormConfig,
} from "../../../data/form";
import { useUserGroup } from "../../../hooks/useUserGroup";

interface UpdateUserGroupPageProps {
  id: number;
}

export default function UpdateUserGroupPage({ id }: UpdateUserGroupPageProps) {
  const router = useRouter();
  const {
    getById,
    update,
    remove,
    submitting: loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useUserGroup();
  const [userGroupData, setUserGroupData] = useState<any>(null);

  const { getAll, loading: loadingUsers } = useWorkspaceUser();
  const [workspaceUsers, setWorkspaceUsers] = useState<
    WorkspaceUserWithRelations[]
  >([]);

  useEffect(() => {
    fetchUserGroup();
  }, [id]);

  const fetchUserGroup = async () => {
    try {
      const data = await getById(id);
      setUserGroupData(data);

      const params: any = { page: 1, limit: 100 };

      const dataU = await getAll(params);

      setWorkspaceUsers(dataU.data);
    } catch (error) {
      console.error("Error fetching workspaceUser group:", error);
    }
  };

  const handleSubmit = async (
    data: z.infer<typeof userGroupFormConfig.validation>
  ) => {
    try {
      await update(id, data);
      router.push("/dashboard/user-groups");
    } catch (error) {
      console.error("Error updating user group:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await remove(id);
      router.push("/dashboard/user-groups");
    } catch (error) {
      console.error("Error deleting workspaceUser group:", error);
    }
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  if (loadingUsers) return <Loading />;

  const data = new Map<string, any>();
  data.set("workspaceUsers", workspaceUsers);

  return (
    <DynamicUpdateWrapper
      title="ویرایش گروه کاربری"
      backUrl="/dashboard/user-groups"
      formConfig={getUserGroupFormConfig(data)}
      defaultValues={userGroupData}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      entityId={id}
      isLoading={loading}
      error={error}
      success={success}
    />
  );
}

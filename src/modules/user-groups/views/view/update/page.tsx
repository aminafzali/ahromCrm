import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DynamicUpdateWrapper from "@/@Client/Components/wrappers/DynamicUpdateWrapper";
import { useUser } from "@/modules/users/hooks/useUser";
import { UserWithRelations } from "@/modules/users/types";
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

  const { getAll, loading: loadingUsers } = useUser();
  const [users, setUsers] = useState<UserWithRelations[]>([]);

  useEffect(() => {
    fetchUserGroup();
  }, [id]);

  const fetchUserGroup = async () => {
    try {
      const data = await getById(id);
      setUserGroupData(data);

      const params: any = { page: 1, limit: 100 };

      const dataU = await getAll(params);

      setUsers(dataU.data);
    } catch (error) {
      console.error("Error fetching user group:", error);
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
      console.error("Error deleting user group:", error);
    }
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  if (loadingUsers) return <Loading />;

  const data = new Map<string, any>();
  data.set("users", users);

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

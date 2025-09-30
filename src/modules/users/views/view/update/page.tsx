"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DynamicUpdateWrapper from "@/@Client/Components/wrappers/DynamicUpdateWrapper";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { LabelWithRelations } from "@/modules/labels/types";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { UserGroupWithRelations } from "@/modules/user-groups/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getUserFormConfig } from "../../../data/form";
import { useUser } from "../../../hooks/useUser";
import { createUserSchema } from "../../../validation/schema";

interface UpdateUserPageProps {
  id: number;
}

export default function UpdateUserPage({ id }: UpdateUserPageProps) {
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
  } = useUser();
  const { getAll: getAllLabels, loading: loadingLabels } = useLabel();
  const { getAll: getAllGroups, loading: loadingGroups } = useUserGroup();
  const [userData, setUserData] = useState<any>(null);
  const [labels, setLabels] = useState<LabelWithRelations[]>([]);
  const [groups, setGroups] = useState<UserGroupWithRelations[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [userData, labelsData, groupsData] = await Promise.all([
        getById(id),
        getAllLabels({ page: 1, limit: 50 }),
        getAllGroups({ page: 1, limit: 50 }),
      ]);
      
      if (userData != undefined) {
        if (!userData.address) {
          userData.address = "";
        }
      }

      setUserData(userData);
      setLabels(labelsData.data);
      setGroups(groupsData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (data: z.infer<typeof createUserSchema>) => {
    try {
      await update(id, data);
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await remove(id);
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (dataLoading || loadingLabels || loadingGroups) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  const data = new Map<string, any>();
  data.set("labels", labels);
  data.set("groups", groups);

  return (
    <DynamicUpdateWrapper
      title="ویرایش مخاطب"
      backUrl="/dashboard/users"
      formConfig={getUserFormConfig(data)}
      defaultValues={userData}
      onSubmit={handleSubmit}
      entityId={id}
      isLoading={loading}
      error={error}
      success={success}
    />
  );
}

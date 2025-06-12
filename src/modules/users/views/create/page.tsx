"use client";

import CreateWrapper from "@/@Client/Components/wrappers/V2/CreateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { getUserFormConfig } from "../../data/form";
import { UserRepository } from "../../repo/UserRepository";
import { createUserSchema } from "../../validation/schema";

export default function CreateUserPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useLabel();
  const { getAll: getAllG } = useUserGroup();

  return (
    <CreateWrapper
      fetchers={[
        {
          key: "labels",
          fetcher: () => getAll({ page: 1, limit: 50 }).then((res) => res.data),
        },
        {
          key: "groups",
          fetcher: () =>
            getAllG({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      title="مخاطب جدید"
      backUrl={back}
      formConfig={getUserFormConfig}
      after={after}
      repo={new UserRepository()} // ✅ Now properly typed
      schema={createUserSchema} // ✅ Now properly constrained
    />
  );
}

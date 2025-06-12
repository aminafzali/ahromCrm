import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useUser } from "@/modules/users/hooks/useUser";
import { getUserGroupFormConfig } from "../../data/form";
import { UserGroupRepository } from "../../repo/UserGroupRepository";
import { createUserGroupSchema } from "../../validation/schema";

export default function CreateUserGroupPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useUser();

  return (
    <CreateWrapper
      fetchers={[
        {
          key: "users",
          fetcher: () => getAll({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      title="گروه کاربری جدید"
      backUrl={back}
      after={after}
      formConfig={getUserGroupFormConfig}
      repo={new UserGroupRepository()}
      schema={createUserGroupSchema}
    />
  );
}

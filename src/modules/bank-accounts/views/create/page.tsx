import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getBankAccountFormConfig } from "../../data/form";
import { BankAccountRepository } from "../../repo/BankAccountRepository";
import { createBankAccountSchema } from "../../validation/schema";

export default function CreateBankAccountPage({
  back = true,
  after,
  defaultValues,
}: CreatePageProps) {
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();

  return (
    <CreateWrapper
      fetchers={[
        {
          key: "workspaceUsers",
          fetcher: () =>
            getAllWorkspaceUsers({ page: 1, limit: 200 }).then(
              (res) => res?.data || []
            ),
        },
      ]}
      title="ایجاد حساب بانکی جدید"
      backUrl={back}
      defaultValues={defaultValues}
      formConfig={getBankAccountFormConfig}
      repo={new BankAccountRepository()}
      schema={createBankAccountSchema}
      after={after}
    />
  );
}

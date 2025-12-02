import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getBankAccountFormConfig } from "../../../data/form";
import { BankAccountRepository } from "../../../repo/BankAccountRepository";
import { updateBankAccountSchema } from "../../../validation/schema";

export default function UpdateBankAccountPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();

  return (
    <UpdateWrapper
      fetchers={[
        {
          key: "workspaceUsers",
          fetcher: () =>
            getAllWorkspaceUsers({ page: 1, limit: 200 }).then(
              (res) => res?.data || []
            ),
        },
      ]}
      title="ویرایش حساب بانکی"
      after={after}
      formConfig={getBankAccountFormConfig}
      repo={new BankAccountRepository()}
      schema={updateBankAccountSchema}
    />
  );
}

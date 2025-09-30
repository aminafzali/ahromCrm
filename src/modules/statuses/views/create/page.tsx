import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getStatusFormConfig } from "../../data/form";
import { StatusRepository } from "../../repo/StatusRepository";

export default function CreateBrandPage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <CreateWrapper
      title="برند جدید"
      backUrl={back}
      after={after}
      formConfig={getStatusFormConfig}
      repo={new StatusRepository()}
    />
  );
}

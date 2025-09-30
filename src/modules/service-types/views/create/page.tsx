import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getServiceTypeFormConfig } from "../../data/form";
import { ServiceTypeRepository } from "../../repo/ServiceTypeRepository";

export default function CreateServiceTypePage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <CreateWrapper
      title="برند جدید"
      backUrl={back}
      after={after}
      formConfig={getServiceTypeFormConfig}
      repo={new ServiceTypeRepository()}
    />
  );
}

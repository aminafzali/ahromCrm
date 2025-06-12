import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getBrandFormConfig } from "../../data/form";
import { BrandRepository } from "../../repo/BrandRepository";

export default function CreateBrandPage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <CreateWrapper
      title="برند جدید"
      backUrl={back}
      after={after}
      formConfig={getBrandFormConfig}
      repo={new BrandRepository()}
    />
  );
}

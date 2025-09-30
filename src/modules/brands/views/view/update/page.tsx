import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { getBrandFormConfig } from "@/modules/brands/data/form";
import { BrandRepository } from "@/modules/brands/repo/BrandRepository";

export default function CreateBrandPage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <UpdateWrapper
      title="برند جدید"
      after={after}
      formConfig={getBrandFormConfig}
      repo={new BrandRepository()}
      back={back}
    />
  );
}

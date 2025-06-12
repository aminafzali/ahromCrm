import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { getUserFormConfig } from "@/modules/fields/data/form";
import { FieldRepository } from "@/modules/fields/repo/FieldRepository";

export default function CreateBrandPage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <UpdateWrapper
      title="برچسپ"
      back={back}
      after={after}
      formConfig={getUserFormConfig}
      repo={new FieldRepository()}
    />
  );
}

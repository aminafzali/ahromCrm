import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { getUserFormConfig } from "@/modules/labels/data/form";
import { LabelRepository } from "@/modules/labels/repo/LabelRepository";

export default function CreateBrandPage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <UpdateWrapper
      title="برچسپ"
      after={after}
      formConfig={getUserFormConfig}
      repo={new LabelRepository()}
    />
  );
}

import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getUserFormConfig } from "@/modules/labels/data/form";
import { LabelRepository } from "@/modules/labels/repo/LabelRepository";

export default function CreateBrandPage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <CreateWrapper
      title="برچسپ"
      backUrl={back}
      after={after}
      formConfig={getUserFormConfig}
      repo={new LabelRepository()}
    />
  );
}

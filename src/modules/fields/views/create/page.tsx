import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getUserFormConfig } from "@/modules/fields/data/form";
import { FieldRepository } from "@/modules/fields/repo/FieldRepository";

export default function CreateFieldPage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <CreateWrapper
      title="برچسپ"
      backUrl={back}
      after={after}
      formConfig={getUserFormConfig}
      repo={new FieldRepository()}
    />
  );
}

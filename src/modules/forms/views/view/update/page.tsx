import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { FormRepository } from "@/modules/forms/repo/FormRepository";
import { getFormConfig } from "../../../data/form";
import { createFormSchema } from "../../../validation/schema";

interface UpdateFormPageProps {
  id: number;
}

export default function UpdateFormPage({ id }: UpdateFormPageProps) {
  return (
    <UpdateWrapper
      title="ویرایش فرم"
      formConfig={getFormConfig}
      repo={new FormRepository()}
      schema={createFormSchema}
    />
  );
}

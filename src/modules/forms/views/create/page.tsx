import { CreateWrapper } from "@/@Client/Components/wrappers";
import { FormRepository } from "@/modules/forms/repo/FormRepository";
import { getFormConfig } from "../../data/form";
import { createFormSchema } from "../../validation/schema";

interface UpdateFormPageProps {
  id: number;
}

export default function UpdateFormPage({ id }: UpdateFormPageProps) {
  return (
    <CreateWrapper
      title="فرم"
      formConfig={getFormConfig}
      repo={new FormRepository()}
      schema={createFormSchema}
    />
  );
}

// مسیر فایل: src/modules/actual-services/views/create/page.tsx

"use client";
import CreateWrapper from "@/@Client/Components/wrappers/V2/CreateWrapper";
import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
import { getActualServiceFormConfig } from "../../data/form";
import { ActualServiceRepository } from "../../repo/ActualServiceRepository";
import { createActualServiceSchema } from "../../validation/schema";

const CreateActualServicePage = () => {
  const { getAll } = useServiceType();

  return (
    <CreateWrapper
      fetchers={[
        {
          key: "service-types",
          fetcher: () => getAll({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      title="افزودن خدمت جدید"
      repo={new ActualServiceRepository()}
      formConfig={getActualServiceFormConfig}
      schema={createActualServiceSchema}
    />
  );
};

export default CreateActualServicePage;

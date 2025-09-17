// مسیر فایل: src/modules/pm-statuses/views/create/page.tsx

"use client";
import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getCreateFormConfig } from "../../data/form";
import { PMStatusRepository } from "../../repo/PMStatusRepository";
import { createPMStatusSchema } from "../../validation/schema";

export default function CreatePage({ back = true, after }: CreatePageProps) {
  return (
    <CreateWrapper
      title="ایجاد وضعیت جدید"
      backUrl={back}
      after={after}
      formConfig={getCreateFormConfig}
      repo={new PMStatusRepository()}
      schema={createPMStatusSchema}
    />
  );
}

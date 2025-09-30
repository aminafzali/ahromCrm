// مسیر فایل: src/modules/actual-services/views/view/update/page.tsx

"use client";
import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
import { getActualServiceFormConfig } from "../../../data/form";
import { ActualServiceRepository } from "../../../repo/ActualServiceRepository";
import { updateActualServiceSchema } from "../../../validation/schema";

// این کامپوننت id را به عنوان prop دریافت نمی‌کند، چون UpdateWrapper خودش آن را از URL می‌خواند
export default function UpdateActualServicePage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useServiceType();

  return (
    <UpdateWrapper
      // پراپرتی id از اینجا حذف شد
      title="ویرایش خدمت"
      after={after}
      repo={new ActualServiceRepository()}
      formConfig={getActualServiceFormConfig}
      schema={updateActualServiceSchema}
      // fetchers برای پر کردن لیست کشویی "نوع خدمت" ضروری است
      fetchers={[
        {
          key: "service-types",
          fetcher: () => getAll({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      back={back}
    />
  );
}

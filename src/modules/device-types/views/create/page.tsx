// src/modules/device-types/views/create/page.tsx

"use client";

import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getDeviceTypeFormConfig } from "../../data/form";
import { DeviceTypeRepository } from "../../repo/DeviceTypeRepository";

export default function CreateDeviceTypePage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <CreateWrapper
      fetchers={[]}
      title="ایجاد نوع دستگاه جدید"
      backUrl={back}
      // خود تابع مستقیماً پاس داده می‌شود
      formConfig={getDeviceTypeFormConfig}
      after={after}
      repo={new DeviceTypeRepository()}
    />
  );
}

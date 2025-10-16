"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columnsForAdmin } from "../data/table";
import { SupportInfoCategoryRepository } from "../repo/SupportCategoryRepository";

export default function SupportInfoCategoryIndexPage() {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new SupportInfoCategoryRepository()}
      title="دسته‌بندی‌های پشتیبانی"
    />
  );
}

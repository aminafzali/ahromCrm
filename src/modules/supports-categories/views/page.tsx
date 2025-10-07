"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columnsForAdmin } from "../data/table";
import { SupportCategoryRepository } from "../repo/SupportCategoryRepository";

export default function IndexPage() {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new SupportCategoryRepository()}
      title="دسته‌بندی‌های پشتیبانی"
    />
  );
}

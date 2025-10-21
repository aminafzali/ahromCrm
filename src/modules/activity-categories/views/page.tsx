"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columnsForAdmin } from "../data/table";
import { ActivityCategoryRepository } from "../repo/ActivityCategoryRepository";

export default function ActivityCategoryIndexPage() {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new ActivityCategoryRepository()}
      title="دسته‌بندی‌های فعالیت"
    />
  );
}

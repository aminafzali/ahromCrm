"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columnsForAdmin } from "../data/table";
import { DocumentCategoryRepository } from "../repo/DocumentCategoryRepository";

export default function DocumentCategoriesPage() {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new DocumentCategoryRepository()}
      title="دسته‌بندی‌های اسناد"
    />
  );
}

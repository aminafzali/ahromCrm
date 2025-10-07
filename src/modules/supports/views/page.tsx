"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columnsForAdmin } from "../data/table";
import { SupportsRepository } from "../repo/SupportsRepository";

export default function SupportsIndexPage() {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new SupportsRepository()}
      title="تیکت‌های پشتیبانی"
      defaultViewMode="list"
    />
  );
}

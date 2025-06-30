// مسیر صحیح: src/modules/actual-services/views/page.tsx

"use client";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin } from "@/modules/actual-services/data/table";
import { ActualServiceRepository } from "@/modules/actual-services/repo/ActualServiceRepository";

export default function ActualServicesPage() {
  return (
    <IndexWrapper
      title="خدمات"
      columns={columnsForAdmin}
      repo={new ActualServiceRepository()}
    />
  );
}

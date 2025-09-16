// مسیر فایل: src/modules/pm-statuses/views/page.tsx

"use client";
import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columns } from "../data/table";
import { PMStatusRepository } from "../repo/PMStatusRepository";

const PMStatusesPage = () => {
  return (
    <IndexWrapper
      columns={columns}
      repo={new PMStatusRepository()}
      title="وضعیت‌های پروژه و وظیفه"
    />
  );
};

export default PMStatusesPage;

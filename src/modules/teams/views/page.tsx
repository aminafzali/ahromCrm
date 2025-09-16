// مسیر فایل: src/modules/teams/views/page.tsx

"use client";
import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columns } from "../data/table";
import { TeamRepository } from "../repo/TeamRepository";

const TeamsPage = () => {
  return (
    <IndexWrapper
      columns={columns}
      repo={new TeamRepository()}
      title="تیم‌ها"
    />
  );
};

export default TeamsPage;
// مسیر فایل: src/modules/projects/views/page.tsx

"use client";
import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columns } from "../data/table";
import { ProjectRepository } from "../repo/ProjectRepository";

const ProjectsPage = () => {
  return (
    <IndexWrapper
      columns={columns}
      repo={new ProjectRepository()}
      title="پروژه‌ها"
    />
  );
};

export default ProjectsPage;

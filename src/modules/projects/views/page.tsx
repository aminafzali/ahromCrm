// مسیر فایل: src/modules/projects/views/page.tsx

"use client";
import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columns, listItemRender } from "../data/table";
import { ProjectRepository } from "../repo/ProjectRepository";

const ProjectsPage = () => {
  return (
    <IndexWrapper
      columns={columns}
      repo={new ProjectRepository()}
      title="پروژه‌ها"
      listItemRender={listItemRender}
      defaultViewMode="list"
    />
  );
};

export default ProjectsPage;

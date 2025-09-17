// مسیر فایل: src/modules/tasks/views/page.tsx

"use client";
import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { columns } from "../data/table";
import { TaskRepository } from "../repo/TaskRepository";

const TasksPage = () => {
  return (
    <IndexWrapper columns={columns} repo={new TaskRepository()} title="وظایف" />
  );
};

export default TasksPage;

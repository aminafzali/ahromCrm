// مسیر فایل: src/modules/tasks/service/TaskServiceApi.ts

import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import { createTaskSchema, updateTaskSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    // نام مدل با حروف کوچک اصلاح شد
    super("Task");
  }
}

export class TaskServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createTaskSchema,
      updateTaskSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }

  /**
   * متد create را برای مدیریت صحیح روابط بازنویسی می‌کنیم.
   */
  async create(data: any, context: AuthContext): Promise<any> {
    const validatedData = this.validate(this.createSchema, data);

    const { assignedUsers, status, project, ...taskData } = validatedData;

    const finalData = {
      ...taskData,
      workspaceId: context.workspaceId,
      statusId: status.id,
      projectId: project.id,
      assignedUsers: assignedUsers
        ? {
            connect: assignedUsers.map((user: { id: number }) => ({
              id: user.id,
            })),
          }
        : undefined,
    };

    return prisma.task.create({
      data: finalData,
      include: include,
    });
  }

  /**
   * متد update را برای مدیریت صحیح روابط بازنویسی می‌کنیم.
   */
  async update(id: number, data: any): Promise<any> {
    const validatedData = this.validate(this.updateSchema, data);

    const { assignedUsers, status, project, ...taskData } = validatedData;

    const finalData = {
      ...taskData,
      ...(status && { statusId: status.id }),
      ...(project && { projectId: project.id }),
      assignedUsers: assignedUsers
        ? {
            set: assignedUsers.map((user: { id: number }) => ({
              id: user.id,
            })),
          }
        : undefined,
    };

    return prisma.task.update({
      where: { id },
      data: finalData,
      include: include,
    });
  }
}

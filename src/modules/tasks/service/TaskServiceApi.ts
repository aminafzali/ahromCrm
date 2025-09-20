// مسیر فایل: src/modules/tasks/service/TaskServiceApi.ts

import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { FullQueryParams } from "@/@Server/types";
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

  // ===== شروع اصلاحیه =====
  /**
   * متد getAll را بازنویسی می‌کنیم تا فیلترهای مجازی 'assignedTo' را برای وظایف پردازش کند.
   */
  async getAll(params: FullQueryParams, context: AuthContext) {
    // اگر آبجکت فیلتر وجود نداشت، آن را ایجاد می‌کنیم
    if (!params.filters) {
      params.filters = {};
    }

    const assignedToFilter = params.filters.assignedTo;

    if (assignedToFilter && context.workspaceUser) {
      delete params.filters.assignedTo;

      if (assignedToFilter === "me") {
        params.filters.assignedUsers = {
          some: {
            workspaceUserId: context.workspaceUser.id,
          },
        };
      } else if (assignedToFilter === "my_teams") {
        const teamMemberships = await prisma.teamMember.findMany({
          where: { workspaceUserId: context.workspaceUser.id },
          select: { teamId: true },
        });
        const teamIds = teamMemberships.map((tm) => tm.teamId);

        if (teamIds.length > 0) {
          params.filters.assignedTeams = {
            some: {
              id: {
                in: teamIds,
              },
            },
          };
        } else {
          // اگر کاربر عضو تیمی نبود، هیچ وظیفه‌ای برنگردان
          params.filters.id = -1;
        }
      }
    }

    // فراخوانی متد اصلی با پارامترهای اصلاح‌شده
    return super.getAll(params, context);
  }
  // ===== پایان اصلاحیه =====

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

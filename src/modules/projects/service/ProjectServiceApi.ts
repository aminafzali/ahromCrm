// مسیر فایل: src/modules/projects/service/ProjectServiceApi.ts

import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import { createProjectSchema, updateProjectSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    // نام مدل با حروف کوچک اصلاح شد
    super("Project");
  }
}

export class ProjectServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createProjectSchema,
      updateProjectSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }

  /**
   * متد create را برای مدیریت صحیح روابط چند-به-چند بازنویسی می‌کنیم.
   */
  async create(data: any, context: AuthContext): Promise<any> {
    const validatedData = this.validate(this.createSchema, data);

    // روابط چند-به-چند را از داده‌های اصلی جدا می‌کنیم
    const { assignedUsers, assignedTeams, status, ...projectData } =
      validatedData;

    // داده‌ها را برای پریزما آماده می‌کنیم
    const finalData = {
      ...projectData,
      workspaceId: context.workspaceId,
      // اتصال به وضعیت (رابطه یک-به-چند)
      statusId: status.id,
      // اتصال به کاربران (رابطه چند-به-چند)
      assignedUsers: assignedUsers
        ? {
            connect: assignedUsers.map((user: { id: number }) => ({
              id: user.id,
            })),
          }
        : undefined,
      // اتصال به تیم‌ها (رابطه چند-به-چند)
      assignedTeams: assignedTeams
        ? {
            connect: assignedTeams.map((team: { id: number }) => ({
              id: team.id,
            })),
          }
        : undefined,
    };

    return prisma.project.create({
      data: finalData,
      include: include,
    });
  }

  /**
   * متد update را برای مدیریت صحیح روابط چند-به-چند بازنویسی می‌کنیم.
   */
  async update(id: number, data: any): Promise<any> {
    const validatedData = this.validate(this.updateSchema, data);

    const { assignedUsers, assignedTeams, status, ...projectData } =
      validatedData;

    const finalData = {
      ...projectData,
      // اگر وضعیت جدیدی ارسال شده بود، آن را آپدیت کن
      ...(status && { statusId: status.id }),
      // برای روابط چند-به-چند از 'set' استفاده می‌کنیم تا لیست قبلی جایگزین شود
      assignedUsers: assignedUsers
        ? {
            set: assignedUsers.map((user: { id: number }) => ({
              id: user.id,
            })),
          }
        : undefined,
      assignedTeams: assignedTeams
        ? {
            set: assignedTeams.map((team: { id: number }) => ({
              id: team.id,
            })),
          }
        : undefined,
    };

    return prisma.project.update({
      where: { id },
      data: finalData,
      include: include,
    });
  }
}

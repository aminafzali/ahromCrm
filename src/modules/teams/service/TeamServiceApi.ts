// مسیر فایل: src/modules/teams/service/TeamServiceApi.ts

import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma"; // Prisma client را برای استفاده مستقیم ایمپورت می‌کنیم
import { connects, include, relations, searchFileds } from "../data/fetch";
import { createTeamSchema, updateTeamSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    // نام مدل باید با حروف کوچک باشد تا با کلاینت پریزما هماهنگ باشد
    super("Team");
  }
}

export class TeamServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createTeamSchema,
      updateTeamSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository(); // این خط برای دسترسی مستقیم لازم است
    this.connect = connects;
  }

  /**
   * متد create را برای مدیریت رابطه چند به چند با اعضا بازنویسی می‌کنیم
   */
  async create(data: any, context: AuthContext): Promise<any> {
    const validatedData = this.validate(this.createSchema, data);
    const { members, ...teamData } = validatedData;

    const finalData = {
      ...teamData,
      workspaceId: context.workspaceId,
      members: members
        ? {
            create: members.map((member: { id: number }) => ({
              workspaceUser: {
                connect: { id: member.id },
              },
            })),
          }
        : undefined,
    };

    // به جای فراخوانی ریپازیتوری با پارامتر اضافه،
    // مستقیماً از پریزما برای ایجاد رکورد با include استفاده می‌کنیم
    // دقیقاً مانند الگوی WorkspaceUserServiceApi
    return prisma.team.create({
      data: finalData,
      include: include, // include اینجا به درستی استفاده می‌شود
    });
  }

  /**
   * متد update را برای مدیریت صحیح آپدیت اعضای تیم بازنویسی می‌کنیم
   */
  async update(id: number, data: any): Promise<any> {
    const validatedData = this.validate(this.updateSchema, data);
    const { members, ...teamData } = validatedData;

    const finalData = {
      ...teamData,
      members: members
        ? {
            // ابتدا تمام اعضای قبلی تیم را حذف می‌کنیم
            deleteMany: {},
            // سپس لیست جدید اعضا را ایجاد و متصل می‌کنیم
            create: members.map((member: { id: number }) => ({
              workspaceUser: {
                connect: { id: member.id },
              },
            })),
          }
        : {
            // اگر لیست اعضا خالی ارسال شده بود، همه را حذف کن
            deleteMany: {},
          },
    };

    // در اینجا نیز مستقیماً از پریزما برای آپدیت استفاده می‌کنیم
    return prisma.team.update({
      where: { id },
      data: finalData,
      include: include, // include اینجا به درستی استفاده می‌شود
    });
  }
}

// مسیر فایل: src/modules/tasks/service/TaskServiceApi.ts
// src/modules/tasks/service/TaskServiceApi.ts
import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { FullQueryParams } from "@/@Server/types";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import { createTaskSchema, updateTaskSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
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

  // getAll: بدون تغییرات مهم، خوبه
  async getAll(params: FullQueryParams, context: AuthContext) {
    if (!params.filters) params.filters = {};

    const assignedToFilter = params.filters.assignedTo;

    if (assignedToFilter && context.workspaceUser) {
      delete params.filters.assignedTo;

      if (assignedToFilter === "me") {
        params.filters.assignedUsers = {
          some: { workspaceUserId: context.workspaceUser.id },
        };
      } else if (assignedToFilter === "my_teams") {
        const teamMemberships = await prisma.teamMember.findMany({
          where: { workspaceUserId: context.workspaceUser.id },
          select: { teamId: true },
        });
        const teamIds = teamMemberships.map((tm) => tm.teamId);

        if (teamIds.length > 0) {
          params.filters.assignedTeams = {
            some: { id: { in: teamIds } },
          };
        } else {
          params.filters.id = -1;
        }
      }
    }

    return super.getAll(params, context);
  }

  // کمک‌کننده: تبدیل تاریخ‌های ورودی (string|null|undefined) به Date | undefined
  private normalizeDates(payload: any) {
    const normalized: any = {};
    if ("startDate" in payload) {
      const v = payload.startDate;
      normalized.startDate = v ? new Date(v) : undefined;
    }
    if ("endDate" in payload) {
      const v = payload.endDate;
      normalized.endDate = v ? new Date(v) : undefined;
    }
    return normalized;
  }

  /**
   * create: محافظت‌شده و پشتیبانی از assignedUsers و assignedTeams
   */
  async create(data: any, context: AuthContext): Promise<any> {
    // محافظت: اگر payload null یا غیرآبجکت است خطای مشخص بدیم
    if (!data || typeof data !== "object") {
      throw new Error("Invalid payload: expected object for creating Task");
    }

    // validate با zod (اگر invalid خواهد throw کرد)
    const validatedData = this.validate(this.createSchema, data);

    // destructure و نرمالایز تاریخ‌ها
    const { assignedUsers, assignedTeams, status, project, ...taskData } =
      validatedData;
    const dateNormal = this.normalizeDates(taskData);

    const finalData: any = {
      ...taskData,
      ...dateNormal,
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
      assignedTeams: assignedTeams
        ? {
            connect: assignedTeams.map((team: { id: number }) => ({
              id: team.id,
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
   * update: مشابه create، پشتیبانی از assignedUsers و assignedTeams
   */
  async update(id: number, data: any): Promise<any> {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid payload: expected object for updating Task");
    }

    const validatedData = this.validate(this.updateSchema, data);
    const { assignedUsers, assignedTeams, status, project, ...taskData } =
      validatedData;
    const dateNormal = this.normalizeDates(taskData);

    const finalData: any = {
      ...taskData,
      ...dateNormal,
      ...(status && { statusId: status.id }),
      ...(project && { projectId: project.id }),
      assignedUsers: assignedUsers
        ? {
            set: assignedUsers.map((user: { id: number }) => ({ id: user.id })),
          }
        : undefined,
      assignedTeams: assignedTeams
        ? {
            set: assignedTeams.map((team: { id: number }) => ({ id: team.id })),
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

// import { AuthContext } from "@/@Server/Http/Controller/BaseController";
// import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
// import { BaseService } from "@/@Server/Http/Service/BaseService";
// import { FullQueryParams } from "@/@Server/types";
// import prisma from "@/lib/prisma";
// import { connects, include, relations, searchFileds } from "../data/fetch";
// import { createTaskSchema, updateTaskSchema } from "../validation/schema";

// class Repository extends BaseRepository<any> {
//   constructor() {
//     // نام مدل با حروف کوچک اصلاح شد
//     super("Task");
//   }
// }

// export class TaskServiceApi extends BaseService<any> {
//   constructor() {
//     super(
//       new Repository(),
//       createTaskSchema,
//       updateTaskSchema,
//       searchFileds,
//       relations
//     );
//     this.repository = new Repository();
//     this.connect = connects;
//   }

//   // ===== شروع اصلاحیه =====
//   /**
//    * متد getAll را بازنویسی می‌کنیم تا فیلترهای مجازی 'assignedTo' را برای وظایف پردازش کند.
//    */
//   async getAll(params: FullQueryParams, context: AuthContext) {
//     // اگر آبجکت فیلتر وجود نداشت، آن را ایجاد می‌کنیم
//     if (!params.filters) {
//       params.filters = {};
//     }

//     const assignedToFilter = params.filters.assignedTo;

//     if (assignedToFilter && context.workspaceUser) {
//       delete params.filters.assignedTo;

//       if (assignedToFilter === "me") {
//         params.filters.assignedUsers = {
//           some: {
//             workspaceUserId: context.workspaceUser.id,
//           },
//         };
//       } else if (assignedToFilter === "my_teams") {
//         const teamMemberships = await prisma.teamMember.findMany({
//           where: { workspaceUserId: context.workspaceUser.id },
//           select: { teamId: true },
//         });
//         const teamIds = teamMemberships.map((tm) => tm.teamId);

//         if (teamIds.length > 0) {
//           params.filters.assignedTeams = {
//             some: {
//               id: {
//                 in: teamIds,
//               },
//             },
//           };
//         } else {
//           // اگر کاربر عضو تیمی نبود، هیچ وظیفه‌ای برنگردان
//           params.filters.id = -1;
//         }
//       }
//     }

//     // فراخوانی متد اصلی با پارامترهای اصلاح‌شده
//     return super.getAll(params, context);
//   }
//   // ===== پایان اصلاحیه =====

//   /**
//    * متد create را برای مدیریت صحیح روابط بازنویسی می‌کنیم.
//    */
//   async create(data: any, context: AuthContext): Promise<any> {
//     const validatedData = this.validate(this.createSchema, data);

//     const { assignedUsers, status, project, ...taskData } = validatedData;

//     const finalData = {
//       ...taskData,
//       workspaceId: context.workspaceId,
//       statusId: status.id,
//       projectId: project.id,
//       assignedUsers: assignedUsers
//         ? {
//             connect: assignedUsers.map((user: { id: number }) => ({
//               id: user.id,
//             })),
//           }
//         : undefined,
//     };

//     return prisma.task.create({
//       data: finalData,
//       include: include,
//     });
//   }

//   /**
//    * متد update را برای مدیریت صحیح روابط بازنویسی می‌کنیم.
//    */
//   async update(id: number, data: any): Promise<any> {
//     const validatedData = this.validate(this.updateSchema, data);

//     const { assignedUsers, status, project, ...taskData } = validatedData;

//     const finalData = {
//       ...taskData,
//       ...(status && { statusId: status.id }),
//       ...(project && { projectId: project.id }),
//       assignedUsers: assignedUsers
//         ? {
//             set: assignedUsers.map((user: { id: number }) => ({
//               id: user.id,
//             })),
//           }
//         : undefined,
//     };

//     return prisma.task.update({
//       where: { id },
//       data: finalData,
//       include: include,
//     });
//   }
// }

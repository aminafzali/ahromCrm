// مسیر فایل: src/modules/tasks/service/TaskServiceApi.ts
import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { FullQueryParams } from "@/@Server/types";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import { createTaskSchema, updateTaskSchema } from "../validation/schema";

/**
 * Repository مخصوص Task (کوچک و ساده)
 */
class Repository extends BaseRepository<any> {
  constructor() {
    super("Task");
  }
}

/**
 * TaskServiceApi (اصلاح‌شده)
 *
 * تغییر مهم: در متد update، مقادیر status/project را *مستقیماً* از payload ورودی (قبل از validate)
 * استخراج می‌کنیم و در finalData قرار می‌دهیم تا اگر schema فیلد status را strip کند، به‌خاطر آن
 * وضعیت تغییر نکند.
 *
 * همچنین لاگ‌گذاری دقیق قبل/بعد از create و update اضافه شده است.
 */
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

  // getAll: بدون تغییرات منطقی مهم
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
          params.filters.assignedTeams = { some: { id: { in: teamIds } } };
        } else {
          params.filters.id = -1;
        }
      }
    }

    return super.getAll(params, context);
  }

  // کمک‌کننده: تبدیل تاریخ‌های ورودی به Date یا undefined
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
   * create: اعتبارسنجی، نرمال‌سازی و تعیین امن orderInStatus
   */
  async create(data: any, context: AuthContext): Promise<any> {
    console.info("[TaskServiceApi.create] called", { incoming: data });
    if (!data || typeof data !== "object") {
      console.error("[TaskServiceApi.create] invalid payload (not object)", {
        data,
      });
      throw new Error("Invalid payload: expected object for creating Task");
    }

    // پشتیبانی از statusId/projectId که ممکن است از فرانت ارسال شوند
    if ("statusId" in data && !("status" in data)) {
      data.status = { id: Number(data.statusId) };
      delete data.statusId;
    }
    if ("projectId" in data && !("project" in data)) {
      data.project = { id: Number(data.projectId) };
      delete data.projectId;
    }

    // workspaceId از context اجباری است
    const wsId = context.workspaceId;
    if (wsId === null || typeof wsId === "undefined") {
      console.error("[TaskServiceApi.create] missing workspaceId in context");
      throw new Error("Missing workspaceId in context");
    }
    const workspaceIdNumber = Number(wsId);
    if (Number.isNaN(workspaceIdNumber)) {
      console.error("[TaskServiceApi.create] invalid workspaceId in context", {
        wsId,
      });
      throw new Error("Invalid workspaceId in context");
    }

    const validatedData = this.validate(this.createSchema, data);
    console.debug("[TaskServiceApi.create] validatedData", { validatedData });

    const { assignedUsers, assignedTeams, status, project, ...taskData } =
      validatedData;
    const dateNormal = this.normalizeDates(taskData);

    const finalData: any = {
      ...taskData,
      ...dateNormal,
      workspaceId: workspaceIdNumber,
      ...(status && typeof status.id !== "undefined"
        ? { statusId: Number(status.id) }
        : {}),
      ...(project && typeof project.id !== "undefined"
        ? { projectId: Number(project.id) }
        : {}),
      assignedUsers: assignedUsers
        ? { connect: assignedUsers.map((u: any) => ({ id: Number(u.id) })) }
        : undefined,
      assignedTeams: assignedTeams
        ? { connect: assignedTeams.map((t: any) => ({ id: Number(t.id) })) }
        : undefined,
    };

    // اگر orderInStatus داده نشده، آن را بعد از بیشینه فعلی قرار بده
    try {
      if (
        (finalData.orderInStatus === undefined ||
          finalData.orderInStatus === null) &&
        status &&
        typeof status.id !== "undefined"
      ) {
        const maxItem = await prisma.task.findFirst({
          where: {
            workspaceId: workspaceIdNumber,
            statusId: Number(status.id),
          },
          orderBy: { orderInStatus: "desc" },
          select: { orderInStatus: true },
        });
        const maxVal =
          typeof maxItem?.orderInStatus === "number"
            ? maxItem!.orderInStatus!
            : 0;
        finalData.orderInStatus = maxVal + 1;
        console.debug("[TaskServiceApi.create] computed orderInStatus", {
          statusId: status.id,
          computed: finalData.orderInStatus,
        });
      }
    } catch (e) {
      console.warn(
        "[TaskServiceApi.create] failed to compute orderInStatus",
        e
      );
    }

    try {
      console.info("[TaskServiceApi.create] creating", { finalData });
      const created = await prisma.task.create({
        data: finalData,
        include: include,
      });
      console.info("[TaskServiceApi.create] created", { id: created.id });
      return created;
    } catch (e) {
      console.error("[TaskServiceApi.create] create failed", e);
      throw e;
    }
  }

  /**
   * update: مهم‌ترین تغییرات اینجاست
   *
   * - مقادیر status/project را *مستقیماً از payload ورودی اصلی* استخراج می‌کنیم (قبل از validate)
   *   تا در صورتی که updateSchema فیلدهای status/project را strip کند، باز هم آنها اعمال شوند.
   * - سپس validatedData را برای بقیهٔ فیلدها استفاده می‌کنیم.
   * - لاگ‌گذاری مفصل داریم.
   */
  async update(id: number, data: any): Promise<any> {
    console.info("[TaskServiceApi.update] called", { id, incoming: data });
    if (!data || typeof data !== "object") {
      console.error("[TaskServiceApi.update] invalid payload (not object)", {
        data,
      });
      throw new Error("Invalid payload: expected object for updating Task");
    }

    // ---------- استخراج مستقیم از payload اصلی (پیش از validate) ----------
    // پشتیبانی از statusId یا status: { id }
    let incomingStatusId: number | undefined;
    if (
      "statusId" in data &&
      data.statusId !== null &&
      data.statusId !== undefined
    ) {
      incomingStatusId = Number(data.statusId);
    } else if (
      data.status &&
      typeof data.status === "object" &&
      "id" in data.status
    ) {
      incomingStatusId = Number(data.status.id);
    }

    // پشتیبانی از projectId یا project
    let incomingProjectId: number | undefined;
    if (
      "projectId" in data &&
      data.projectId !== null &&
      data.projectId !== undefined
    ) {
      incomingProjectId = Number(data.projectId);
    } else if (
      data.project &&
      typeof data.project === "object" &&
      "id" in data.project
    ) {
      incomingProjectId = Number(data.project.id);
    }

    // اگر statusId یا projectId موجود نبودند، incomingStatusId/incomingProjectId خواهند بود undefined
    console.debug(
      "[TaskServiceApi.update] incomingStatusId / incomingProjectId (from raw payload)",
      { incomingStatusId, incomingProjectId }
    );

    // حال validate را اجرا کن (برای فیلدهای مجاز و دیگر تغییرها)
    const validatedData = this.validate(this.updateSchema, data);
    console.debug("[TaskServiceApi.update] validatedData", { validatedData });

    // destructure از validatedData برای بقیه فیلدها (ولی status/project را از validatedData نخواهیم خواند)
    const {
      assignedUsers,
      assignedTeams,
      status: validatedStatus,
      project: validatedProject,
      ...taskData
    } = validatedData;
    const dateNormal = this.normalizeDates(taskData);

    // finalData را از validatedData بساز، اما برای statusId/projectId از incoming (raw) استفاده کن اگر موجود باشد
    const finalData: any = {
      ...taskData,
      ...dateNormal,
      // اگر در payload اصلی statusId ارسال شده بود، استفاده کن — این تضمین می‌کند که status تغییر کند
      ...(typeof incomingStatusId !== "undefined"
        ? { statusId: incomingStatusId }
        : {}),
      ...(typeof incomingProjectId !== "undefined"
        ? { projectId: incomingProjectId }
        : {}),
      // اگر validatedData شامل assignedUsers/assignedTeams بود، از آن استفاده کن
      assignedUsers: assignedUsers
        ? {
            set: assignedUsers.map((user: { id: number }) => ({
              id: Number(user.id),
            })),
          }
        : undefined,
      assignedTeams: assignedTeams
        ? {
            set: assignedTeams.map((team: { id: number }) => ({
              id: Number(team.id),
            })),
          }
        : undefined,
    };

    console.debug(
      "[TaskServiceApi.update] pre-order computation finalData (before computing order if needed)",
      { finalData }
    );

    // اگر status تغییر کرده و orderInStatus ارسال نشده باشد، مقدار انتهایی ستون مقصد را حساب کن
    try {
      // status exists either via incomingStatusId or via validatedStatus (fallback)
      const effectiveStatusId =
        typeof finalData.statusId !== "undefined"
          ? Number(finalData.statusId)
          : validatedStatus && validatedStatus.id
          ? Number(validatedStatus.id)
          : undefined;

      if (
        typeof effectiveStatusId !== "undefined" &&
        (finalData.orderInStatus === undefined ||
          finalData.orderInStatus === null)
      ) {
        const maxItem = await prisma.task.findFirst({
          where: { statusId: effectiveStatusId },
          orderBy: { orderInStatus: "desc" },
          select: { orderInStatus: true },
        });
        const maxVal =
          typeof maxItem?.orderInStatus === "number"
            ? maxItem!.orderInStatus!
            : 0;
        finalData.orderInStatus = maxVal + 1;
        console.debug(
          "[TaskServiceApi.update] computed orderInStatus for moved task",
          { taskId: id, effectiveStatusId, newOrder: finalData.orderInStatus }
        );
      }
    } catch (e) {
      console.warn(
        "[TaskServiceApi.update] failed to compute orderInStatus on update",
        e
      );
    }

    try {
      console.info("[TaskServiceApi.update] updating DB with finalData", {
        id,
        finalData,
      });
      const updated = await prisma.task.update({
        where: { id },
        data: finalData,
        include: include,
      });
      console.info("[TaskServiceApi.update] updated", { id: updated.id });
      return updated;
    } catch (e) {
      console.error("[TaskServiceApi.update] update failed", e);
      throw e;
    }
  }
}

// // src/modules/tasks/service/TaskServiceApi.ts
// import { AuthContext } from "@/@Server/Http/Controller/BaseController";
// import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
// import { BaseService } from "@/@Server/Http/Service/BaseService";
// import { FullQueryParams } from "@/@Server/types";
// import prisma from "@/lib/prisma";
// import { connects, include, relations, searchFileds } from "../data/fetch";
// import { createTaskSchema, updateTaskSchema } from "../validation/schema";

// class Repository extends BaseRepository<any> {
//   constructor() {
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

//   // getAll: بدون تغییرات مهم، خوبه
//   async getAll(params: FullQueryParams, context: AuthContext) {
//     if (!params.filters) params.filters = {};

//     const assignedToFilter = params.filters.assignedTo;

//     if (assignedToFilter && context.workspaceUser) {
//       delete params.filters.assignedTo;

//       if (assignedToFilter === "me") {
//         params.filters.assignedUsers = {
//           some: { workspaceUserId: context.workspaceUser.id },
//         };
//       } else if (assignedToFilter === "my_teams") {
//         const teamMemberships = await prisma.teamMember.findMany({
//           where: { workspaceUserId: context.workspaceUser.id },
//           select: { teamId: true },
//         });
//         const teamIds = teamMemberships.map((tm) => tm.teamId);

//         if (teamIds.length > 0) {
//           params.filters.assignedTeams = {
//             some: { id: { in: teamIds } },
//           };
//         } else {
//           params.filters.id = -1;
//         }
//       }
//     }

//     return super.getAll(params, context);
//   }

//   // کمک‌کننده: تبدیل تاریخ‌های ورودی (string|null|undefined) به Date | undefined
//   private normalizeDates(payload: any) {
//     const normalized: any = {};
//     if ("startDate" in payload) {
//       const v = payload.startDate;
//       normalized.startDate = v ? new Date(v) : undefined;
//     }
//     if ("endDate" in payload) {
//       const v = payload.endDate;
//       normalized.endDate = v ? new Date(v) : undefined;
//     }
//     return normalized;
//   }

//   /**
//    * create: محافظت‌شده و پشتیبانی از assignedUsers و assignedTeams
//    */
//   async create(data: any, context: AuthContext): Promise<any> {
//     // محافظت: اگر payload null یا غیرآبجکت است خطای مشخص بدیم
//     if (!data || typeof data !== "object") {
//       throw new Error("Invalid payload: expected object for creating Task");
//     }

//     // validate با zod (اگر invalid خواهد throw کرد)
//     const validatedData = this.validate(this.createSchema, data);

//     // destructure و نرمالایز تاریخ‌ها
//     const { assignedUsers, assignedTeams, status, project, ...taskData } =
//       validatedData;
//     const dateNormal = this.normalizeDates(taskData);

//     const finalData: any = {
//       ...taskData,
//       ...dateNormal,
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
//       assignedTeams: assignedTeams
//         ? {
//             connect: assignedTeams.map((team: { id: number }) => ({
//               id: team.id,
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
//    * update: مشابه create، پشتیبانی از assignedUsers و assignedTeams
//    */
//   async update(id: number, data: any): Promise<any> {
//     if (!data || typeof data !== "object") {
//       throw new Error("Invalid payload: expected object for updating Task");
//     }

//     const validatedData = this.validate(this.updateSchema, data);
//     const { assignedUsers, assignedTeams, status, project, ...taskData } =
//       validatedData;
//     const dateNormal = this.normalizeDates(taskData);

//     const finalData: any = {
//       ...taskData,
//       ...dateNormal,
//       ...(status && { statusId: status.id }),
//       ...(project && { projectId: project.id }),
//       assignedUsers: assignedUsers
//         ? {
//             set: assignedUsers.map((user: { id: number }) => ({ id: user.id })),
//           }
//         : undefined,
//       assignedTeams: assignedTeams
//         ? {
//             set: assignedTeams.map((team: { id: number }) => ({ id: team.id })),
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

// // import { AuthContext } from "@/@Server/Http/Controller/BaseController";
// // import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
// // import { BaseService } from "@/@Server/Http/Service/BaseService";
// // import { FullQueryParams } from "@/@Server/types";
// // import prisma from "@/lib/prisma";
// // import { connects, include, relations, searchFileds } from "../data/fetch";
// // import { createTaskSchema, updateTaskSchema } from "../validation/schema";

// // class Repository extends BaseRepository<any> {
// //   constructor() {
// //     // نام مدل با حروف کوچک اصلاح شد
// //     super("Task");
// //   }
// // }

// // export class TaskServiceApi extends BaseService<any> {
// //   constructor() {
// //     super(
// //       new Repository(),
// //       createTaskSchema,
// //       updateTaskSchema,
// //       searchFileds,
// //       relations
// //     );
// //     this.repository = new Repository();
// //     this.connect = connects;
// //   }

// //   // ===== شروع اصلاحیه =====
// //   /**
// //    * متد getAll را بازنویسی می‌کنیم تا فیلترهای مجازی 'assignedTo' را برای وظایف پردازش کند.
// //    */
// //   async getAll(params: FullQueryParams, context: AuthContext) {
// //     // اگر آبجکت فیلتر وجود نداشت، آن را ایجاد می‌کنیم
// //     if (!params.filters) {
// //       params.filters = {};
// //     }

// //     const assignedToFilter = params.filters.assignedTo;

// //     if (assignedToFilter && context.workspaceUser) {
// //       delete params.filters.assignedTo;

// //       if (assignedToFilter === "me") {
// //         params.filters.assignedUsers = {
// //           some: {
// //             workspaceUserId: context.workspaceUser.id,
// //           },
// //         };
// //       } else if (assignedToFilter === "my_teams") {
// //         const teamMemberships = await prisma.teamMember.findMany({
// //           where: { workspaceUserId: context.workspaceUser.id },
// //           select: { teamId: true },
// //         });
// //         const teamIds = teamMemberships.map((tm) => tm.teamId);

// //         if (teamIds.length > 0) {
// //           params.filters.assignedTeams = {
// //             some: {
// //               id: {
// //                 in: teamIds,
// //               },
// //             },
// //           };
// //         } else {
// //           // اگر کاربر عضو تیمی نبود، هیچ وظیفه‌ای برنگردان
// //           params.filters.id = -1;
// //         }
// //       }
// //     }

// //     // فراخوانی متد اصلی با پارامترهای اصلاح‌شده
// //     return super.getAll(params, context);
// //   }
// //   // ===== پایان اصلاحیه =====

// //   /**
// //    * متد create را برای مدیریت صحیح روابط بازنویسی می‌کنیم.
// //    */
// //   async create(data: any, context: AuthContext): Promise<any> {
// //     const validatedData = this.validate(this.createSchema, data);

// //     const { assignedUsers, status, project, ...taskData } = validatedData;

// //     const finalData = {
// //       ...taskData,
// //       workspaceId: context.workspaceId,
// //       statusId: status.id,
// //       projectId: project.id,
// //       assignedUsers: assignedUsers
// //         ? {
// //             connect: assignedUsers.map((user: { id: number }) => ({
// //               id: user.id,
// //             })),
// //           }
// //         : undefined,
// //     };

// //     return prisma.task.create({
// //       data: finalData,
// //       include: include,
// //     });
// //   }

// //   /**
// //    * متد update را برای مدیریت صحیح روابط بازنویسی می‌کنیم.
// //    */
// //   async update(id: number, data: any): Promise<any> {
// //     const validatedData = this.validate(this.updateSchema, data);

// //     const { assignedUsers, status, project, ...taskData } = validatedData;

// //     const finalData = {
// //       ...taskData,
// //       ...(status && { statusId: status.id }),
// //       ...(project && { projectId: project.id }),
// //       assignedUsers: assignedUsers
// //         ? {
// //             set: assignedUsers.map((user: { id: number }) => ({
// //               id: user.id,
// //             })),
// //           }
// //         : undefined,
// //     };

// //     return prisma.task.update({
// //       where: { id },
// //       data: finalData,
// //       include: include,
// //     });
// //   }
// // }

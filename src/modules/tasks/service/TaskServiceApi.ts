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

    // پشتیبانی از globalStatusId/statusId/projectStatusId که ممکن است از فرانت ارسال شوند
    if ("globalStatusId" in data && !("globalStatus" in data)) {
      data.globalStatus = { id: Number(data.globalStatusId) };
      delete data.globalStatusId;
    }
    if ("statusId" in data && !("globalStatus" in data)) {
      data.globalStatus = { id: Number(data.statusId) };
      delete data.statusId;
    }
    if ("projectStatusId" in data && !("projectStatus" in data)) {
      const value = data.projectStatusId;
      if (value !== null && value !== undefined) {
        data.projectStatus = { id: Number(value) };
      }
      delete data.projectStatusId;
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

    const {
      assignedUsers,
      assignedTeams,
      globalStatus,
      projectStatus,
      project,
      ...taskData
    } = validatedData;
    const dateNormal = this.normalizeDates(taskData);

    if (!globalStatus) {
      throw new Error("globalStatus is required for creating a task");
    }

    const finalData: any = {
      ...taskData,
      ...dateNormal,
      workspaceId: workspaceIdNumber,
      statusId: Number(globalStatus.id),
      ...(project && typeof project.id !== "undefined"
        ? { projectId: Number(project.id) }
        : {}),
      projectStatusId: projectStatus ? Number(projectStatus.id) : null,
      assignedUsers: assignedUsers
        ? { connect: assignedUsers.map((u: any) => ({ id: Number(u.id) })) }
        : undefined,
      assignedTeams: assignedTeams
        ? { connect: assignedTeams.map((t: any) => ({ id: Number(t.id) })) }
        : undefined,
    };

    if (finalData.projectStatusId === null) {
      finalData.projectOrderInStatus = null;
    }

    // اگر orderInStatus داده نشده، آن را بعد از بیشینه فعلی قرار بده
    try {
      if (
        (finalData.orderInStatus === undefined ||
          finalData.orderInStatus === null) &&
        finalData.statusId
      ) {
        const maxItem = await prisma.task.findFirst({
          where: {
            workspaceId: workspaceIdNumber,
            statusId: Number(finalData.statusId),
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
          statusId: finalData.statusId,
          computed: finalData.orderInStatus,
        });
      }
    } catch (e) {
      console.warn(
        "[TaskServiceApi.create] failed to compute orderInStatus",
        e
      );
    }

    // ترتیب مخصوص وضعیت پروژه
    try {
      if (
        finalData.projectStatusId &&
        (finalData.projectOrderInStatus === undefined ||
          finalData.projectOrderInStatus === null)
      ) {
        const maxItem = await prisma.task.findFirst({
          where: {
            workspaceId: workspaceIdNumber,
            projectStatusId: Number(finalData.projectStatusId),
          },
          orderBy: { projectOrderInStatus: "desc" },
          select: { projectOrderInStatus: true },
        });
        const maxVal =
          typeof maxItem?.projectOrderInStatus === "number"
            ? maxItem.projectOrderInStatus
            : 0;
        finalData.projectOrderInStatus = maxVal + 1;
        console.debug("[TaskServiceApi.create] computed projectOrderInStatus", {
          projectStatusId: finalData.projectStatusId,
          computed: finalData.projectOrderInStatus,
        });
      }
    } catch (e) {
      console.warn(
        "[TaskServiceApi.create] failed to compute projectOrderInStatus",
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
    // پشتیبانی از globalStatusId/statusId یا globalStatus: { id }
    let incomingGlobalStatusId: number | undefined;
    if (
      "globalStatusId" in data &&
      data.globalStatusId !== null &&
      data.globalStatusId !== undefined
    ) {
      incomingGlobalStatusId = Number(data.globalStatusId);
    } else if (
      "statusId" in data &&
      data.statusId !== null &&
      data.statusId !== undefined
    ) {
      incomingGlobalStatusId = Number(data.statusId);
    } else if (
      data.globalStatus &&
      typeof data.globalStatus === "object" &&
      "id" in data.globalStatus
    ) {
      incomingGlobalStatusId = Number(data.globalStatus.id);
    } else if (
      data.status &&
      typeof data.status === "object" &&
      "id" in data.status
    ) {
      incomingGlobalStatusId = Number(data.status.id);
    }

    // پشتیبانی از projectStatusId یا projectStatus
    let incomingProjectStatusId: number | null | undefined;
    if ("projectStatusId" in data) {
      const raw = data.projectStatusId;
      incomingProjectStatusId =
        raw === null || raw === undefined ? null : Number(raw);
    } else if (
      data.projectStatus &&
      typeof data.projectStatus === "object" &&
      "id" in data.projectStatus
    ) {
      incomingProjectStatusId = Number(data.projectStatus.id);
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
      "[TaskServiceApi.update] incoming status/project ids (from raw payload)",
      { incomingGlobalStatusId, incomingProjectStatusId, incomingProjectId }
    );

    // حال validate را اجرا کن (برای فیلدهای مجاز و دیگر تغییرها)
    const validatedData = this.validate(this.updateSchema, data);
    console.debug("[TaskServiceApi.update] validatedData", { validatedData });

    // destructure از validatedData برای بقیه فیلدها (ولی status/project را از validatedData نخواهیم خواند)
    const {
      assignedUsers,
      assignedTeams,
      globalStatus,
      projectStatus,
      project: validatedProject,
      ...taskData
    } = validatedData;
    const dateNormal = this.normalizeDates(taskData);

    // finalData را از validatedData بساز، اما برای statusId/projectId از incoming (raw) استفاده کن اگر موجود باشد
    const finalData: any = {
      ...taskData,
      ...dateNormal,
      ...(typeof incomingGlobalStatusId !== "undefined"
        ? { statusId: incomingGlobalStatusId }
        : globalStatus
        ? { statusId: Number(globalStatus.id) }
        : {}),
      ...(typeof incomingProjectId !== "undefined"
        ? { projectId: incomingProjectId }
        : validatedProject && validatedProject.id
        ? { projectId: validatedProject.id }
        : {}),
      ...(incomingProjectStatusId !== undefined
        ? { projectStatusId: incomingProjectStatusId }
        : projectStatus
        ? { projectStatusId: Number(projectStatus.id) }
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

    if (finalData.projectStatusId === null) {
      finalData.projectOrderInStatus = null;
    }

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

    // اگر وضعیت پروژه تغییر کرد و ترتیبش ارسال نشده بود، محاسبه کن
    try {
      const effectiveProjectStatusId =
        typeof finalData.projectStatusId !== "undefined"
          ? finalData.projectStatusId
          : undefined;

      if (
        effectiveProjectStatusId &&
        (finalData.projectOrderInStatus === undefined ||
          finalData.projectOrderInStatus === null)
      ) {
        const maxItem = await prisma.task.findFirst({
          where: { projectStatusId: effectiveProjectStatusId },
          orderBy: { projectOrderInStatus: "desc" },
          select: { projectOrderInStatus: true },
        });
        const maxVal =
          typeof maxItem?.projectOrderInStatus === "number"
            ? maxItem.projectOrderInStatus
            : 0;
        finalData.projectOrderInStatus = maxVal + 1;
        console.debug(
          "[TaskServiceApi.update] computed projectOrderInStatus for moved task",
          {
            taskId: id,
            effectiveProjectStatusId,
            newOrder: finalData.projectOrderInStatus,
          }
        );
      }
    } catch (e) {
      console.warn(
        "[TaskServiceApi.update] failed to compute projectOrderInStatus on update",
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

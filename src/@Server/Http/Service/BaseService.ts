// مسیر فایل: src/@Server/Http/Service/BaseService.ts

import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  NotFoundException,
  ValidationException,
} from "../../Exceptions/BaseException";
import {
  FullQueryParams,
  PaginationResult,
  SingleParams,
  StatusChangeEvent,
} from "../../types";
import { AuthContext } from "../Controller/BaseController";
import { BaseRepository } from "../Repository/BaseRepository";

export abstract class BaseService<T> {
  protected repository: BaseRepository<T>;
  protected searchableFields?: string[] = [];
  protected createSchema: z.ZodType<any> = z.object({});
  protected updateSchema: z.ZodType<any> = z.object({});
  protected relations?: string[] = [];
  protected connect?: string[] = [];
  protected defaultFilter?: Record<string, any> = {};

  // Event handlers
  protected beforeCreate?: (data: any, context: AuthContext) => Promise<any>;
  protected afterCreate?: (entity: T, data?: any) => Promise<void>;
  protected beforeUpdate?: (id: number | string, data: any) => Promise<any>;
  protected afterUpdate?: (entity: T) => Promise<void>;
  protected beforeDelete?: (id: number | string) => Promise<void>;
  protected afterDelete?: (id: number | string) => Promise<void>;
  protected beforeStatusChange?: (event: StatusChangeEvent) => Promise<void>;
  protected afterStatusChange?: (entity: T, data?: any) => Promise<void>;
  service: any;

  constructor(
    repository: BaseRepository<T>,
    createSchema: z.ZodType<any>,
    updateSchema: z.ZodType<any>,
    searchableFields?: string[],
    relations?: string[],
    defaultFilter?: Record<string, any>
  ) {
    this.repository = repository;
    this.createSchema = createSchema;
    this.updateSchema = updateSchema;
    this.searchableFields = searchableFields;
    this.defaultFilter = defaultFilter;
    this.relations = relations;
  }

  protected validate<S>(schema: z.ZodType<S>, data: any): S {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });
        throw new ValidationException(formattedErrors);
      }
      throw error;
    }
  }

  async create(data: any, context: AuthContext): Promise<T> {
    // ===== لاگ ردیابی ۱: داده‌های خام ورودی از کنترلر =====
    console.log(
      `%c[BaseService - create] 1. Initial data received from controller:`,
      "color: #6f42c1; font-weight: bold;",
      JSON.parse(JSON.stringify(data))
    );
    // =======================================================

    if (this.createSchema) {
      data = this.validate(this.createSchema, data);
      // ===== لاگ ردیابی ۲: داده‌ها پس از اعتبارسنجی Zod =====
      console.log(
        `%c[BaseService - create] 2. Data after Zod validation:`,
        "color: #6f42c1;",
        JSON.parse(JSON.stringify(data))
      );
      // ====================================================
    }

    const finalData = { ...data };
    if (this.connect && this.connect.length > 0) {
      for (const field of this.connect) {
        if (
          finalData[field] &&
          typeof finalData[field] === "object" &&
          "id" in finalData[field]
        ) {
          finalData[`${field}Id`] = finalData[field].id;
          delete finalData[field];
        }
      }
    }

    // ===== لاگ ردیابی ۳: داده‌ها پس از تبدیل آبجکت به شناسه (connect) =====
    console.log(
      `%c[BaseService - create] 3. Data after 'connect' transformation:`,
      "color: #6f42c1;",
      JSON.parse(JSON.stringify(finalData))
    );
    // ===================================================================

    // ===== شروع اصلاحیه کلیدی =====
    // ما context را به processDynamicFields پاس می‌دهیم
    const processedData = await this.processDynamicFields(
      finalData,
      false,
      context
    );
    // ===== پایان اصلاحیه کلیدی =====

    // ===== لاگ ردیابی ۴: داده‌ها پس از پردازش فیلدهای داینامیک =====
    console.log(
      `%c[BaseService - create] 4. Data after 'processDynamicFields':`,
      "color: #6f42c1;",
      JSON.parse(JSON.stringify(processedData))
    );
    // ===============================================================

    if (context.workspaceId) {
      processedData.workspaceId = context.workspaceId;
    }

    if (
      context.user &&
      this.createSchema instanceof z.ZodObject &&
      "userId" in this.createSchema.shape
    ) {
      processedData.userId = context.user.id;
    }

    let dataToCreate = processedData;
    if (this.beforeCreate) {
      dataToCreate = await this.beforeCreate(processedData, context);
      // ===== لاگ ردیابی ۵: داده‌ها پس از اجرای هوک beforeCreate =====
      console.log(
        `%c[BaseService - create] 5. Data after 'beforeCreate' hook:`,
        "color: #6f42c1;",
        JSON.parse(JSON.stringify(dataToCreate))
      );
      // ===========================================================
    }

    // ===== لاگ ردیابی ۶: داده‌های نهایی قبل از ارسال به دیتابیس =====
    console.log(
      `%c[BaseService - create] 6. Final data being sent to repository.create:`,
      "color: #dc3545; font-weight: bold;",
      JSON.parse(JSON.stringify(dataToCreate))
    );
    // ===============================================================

    const entity = await this.repository.create(dataToCreate);

    if (this.afterCreate) {
      await this.afterCreate(entity, data); // به هوک afterCreate داده‌های اصلی و اعتبارسنجی شده را پاس می‌دهیم
    }

    // ===== لاگ ردیابی ۷: موجودیت ساخته شده در دیتابیس =====
    console.log(
      `%c[BaseService - create] 7. ✅ Entity successfully created:`,
      "color: #28a745; font-weight: bold;",
      entity
    );
    // =======================================================

    return entity;
  }

  // ... تمام متدها و منطق‌های دیگر شما در این فایل دست‌نخورده و قدرتمند باقی می‌مانند ...

  async getAll(
    params: FullQueryParams = { page: 1, limit: 10 },
    context?: AuthContext // پارامتر context به صورت اختیاری اضافه شد
  ): Promise<PaginationResult<T>> {
    params.searchFields = this.searchableFields;
    const defaultFilter = this.defaultFilter;
    params.filters = { ...params.filters, ...defaultFilter };
    return this.repository.findAll(params);
  }

  async getById(id: number | string, params: SingleParams = {}): Promise<T> {
    return this.repository.findById(id, params);
  }

  async getBy(field: string, value: any, include: any = {}): Promise<T[]> {
    return this.repository.findBy(field, value, include);
  }

  async getOneBy(
    field: string,
    value: any,
    include: any = {}
  ): Promise<T | null> {
    return this.repository.findOneBy(field, value, include);
  }

  async createMany(data: any[]): Promise<{ count: number }> {
    if (this.createSchema) {
      data = data.map((item) => this.validate(this.createSchema, item));
    }
    return this.repository.createMany(data);
  }

  async update(id: number, data: any): Promise<T> {
    if (this.updateSchema) {
      data = this.validate(this.updateSchema, data);
    }
    if (this.beforeUpdate) {
      data = await this.beforeUpdate(id, data);
    }
    data = await this.processDynamicFields(data, true);
    const entity = await this.repository.update(id, data);
    if (this.afterUpdate) {
      await this.afterUpdate(entity);
    }
    return entity;
  }

  async put(id: number, data: any): Promise<T> {
    data = await this.processDynamicFields(data);
    const entity = await this.repository.put(id, data);
    return entity;
  }

  async createReminder(id: number, data: any) {
    const entityData = await this.repository.findById(id);
    const rawDueDate = data.dueDate;
    const dueDate = new Date(rawDueDate);
    const reminderData = {
      title: data.title,
      description: data.description,
      dueDate,
      type: this.repository.getModelName(),
      entityId: (entityData as any).id,
      entityType: this.repository.getModelName(),
      workspaceUserId: (entityData as any).workspaceUserId,
      workspaceId: (entityData as any).workspaceId,
      notified: false,
      status: "PENDING",
    };
    const entity = await prisma.reminder.create({ data: reminderData as any });
    return entity;
  }

  async updateMany(where: any, data: any): Promise<{ count: number }> {
    if (this.updateSchema) {
      data = this.validate(this.updateSchema, data);
    }
    return this.repository.updateMany(where, data);
  }

  async upsert(where: any, create: any, update: any): Promise<T> {
    if (this.createSchema) {
      create = this.validate(this.createSchema, create);
    }
    if (this.updateSchema) {
      update = this.validate(this.updateSchema, update);
    }
    return this.repository.upsert(where, create, update);
  }

  async delete(id: number | string): Promise<T> {
    if (this.beforeDelete) {
      await this.beforeDelete(id);
    }
    const entity = await this.repository.delete(id);
    if (this.afterDelete) {
      await this.afterDelete(id);
    }
    return entity;
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return this.repository.deleteMany(where);
  }

  async exists(where: any): Promise<boolean> {
    return this.repository.exists(where);
  }

  async count(where: any = {}): Promise<number> {
    return this.repository.count(where);
  }

  async updateStatus(
    id: number,
    statusId: number,
    note?: string,
    sendSms?: boolean,
    metadata: any = {},
    context?: AuthContext,
    include?: Record<string, boolean | object>
  ): Promise<T> {
    console.log(
      `%c[BaseService - updateStatus] 1. Service method initiated for ID: ${id}`,
      "color: #fd7e14; font-weight: bold;",
      { statusId, note, sendSms, include }
    );

    // ===== شروع اصلاحیه کلیدی ۱: تعریف متغیرها در Scope بالاتر =====
    let updatedEntity: any;
    let oldStatus: any;
    let newStatus: any;
    // ===== پایان اصلاحیه کلیدی ۱ =====

    try {
      await prisma.$transaction(async (tx) => {
        console.log(
          `%c[BaseService - updateStatus] 2. Starting Prisma transaction...`,
          "color: #fd7e14;"
        );

        const modelName = this.repository.getModelName();
        const modelDelegate = (tx as any)[modelName];

        console.log(
          `[BaseService - updateStatus]   - Finding entity with ID: ${id}`
        );
        const entity = await modelDelegate.findUnique({
          where: { id },
          include: { status: true }, // فقط status را برای گرفتن oldStatus لازم داریم
        });

        if (!entity) {
          throw new NotFoundException(`${modelName} not found`);
        }
        console.log(
          `%c[BaseService - updateStatus] 3. Found initial entity.`,
          "color: #fd7e14;"
        );

        oldStatus = entity.status;

        console.log(
          `[BaseService - updateStatus]   - Updating entity with new statusId: ${statusId}`
        );
        // آپدیت را بدون include انجام می‌دهیم تا سبک‌تر باشد
        updatedEntity = await modelDelegate.update({
          where: { id },
          data: { statusId, note },
          include: { status: true, workspaceUser: { include: { user: true } } }, // include کامل برای هوک
        });
        console.log(
          `%c[BaseService - updateStatus] 4. ✅ Entity updated successfully inside transaction.`,
          "color: #28a745;"
        );

        newStatus = updatedEntity.status;

        if (context?.workspaceUser) {
          console.log(
            `%c[BaseService - updateStatus] 5. Creating status history record...`,
            "color: #fd7e14;"
          );
          await tx.requestStatusHistory.create({
            data: {
              requestId: id,
              oldStatusId: oldStatus?.id,
              newStatusId: newStatus.id,
              changedById: context.workspaceUser.id,
              workspaceId: context.workspaceId!,
            },
          });
          console.log(
            `%c[BaseService - updateStatus] 6. ✅ Status history created.`,
            "color: #28a745;"
          );
        }
      });

      console.log(
        `%c[BaseService - updateStatus] 7. ✅ Transaction finished successfully.`,
        "color: #28a745; font-weight: bold;"
      );

      // ===== شروع اصلاحیه کلیدی ۲: انتقال هوک به بعد از تراکنش =====
      if (this.afterStatusChange) {
        console.log(
          `%c[BaseService - updateStatus] 8. Calling 'afterStatusChange' hook...`,
          "color: #fd7e14;"
        );
        await this.afterStatusChange(updatedEntity, {
          sendSms,
          note,
          oldStatus: oldStatus?.name,
          newStatus: newStatus.name,
        });
        console.log(
          `%c[BaseService - updateStatus] 9. ✅ 'afterStatusChange' hook finished.`,
          "color: #28a745;"
        );
      }
      // ===== پایان اصلاحیه کلیدی ۲ =====

      const finalInclude = include || {};
      console.log(
        `%c[BaseService - updateStatus] 10. Re-fetching the updated entity with final include...`,
        "color: #17a2b8; font-weight: bold;"
      );

      const cleanUpdatedEntity = await this.repository.findById(id, {
        include: finalInclude,
      });

      console.log(
        `%c[BaseService - updateStatus] 11. ✅ Final clean entity fetched successfully. Returning to controller.`,
        "color: #28a745; font-weight: bold;"
      );

      return cleanUpdatedEntity;
    } catch (error) {
      console.error(
        `%c[BaseService - updateStatus] ❌ ERROR during operation:`,
        "color: #dc3545; font-weight: bold;",
        error
      );
      throw error;
    }
  }

  async link(
    id: number | string,
    relation: string,
    relatedIds: number[] | string[]
  ): Promise<T> {
    return this.repository.link(id, relation, relatedIds);
  }

  async unlink(
    id: number | string,
    relation: string,
    relatedIds: number[] | string[]
  ): Promise<T> {
    return this.repository.unlink(id, relation, relatedIds);
  }

  protected async processDynamicFields(
    data: any,
    update: boolean = false,
    context?: AuthContext // ۱. context را به عنوان پارامتر جدید دریافت می‌کنیم
  ): Promise<any> {
    if (this.relations && this.relations.length > 0) {
      for (const field of this.relations) {
        if (data[field] && Array.isArray(data[field])) {
          data[field] = {
            create: data[field].map((item: any) => ({
              ...item,
              // ===== شروع اصلاحیه کلیدی =====
              // اگر context وجود داشت، شناسه ورک‌اسپیس را به هر آیتم تو در تو اضافه می‌کنیم
              ...(context?.workspaceId && { workspaceId: context.workspaceId }),
              // ===== پایان اصلاحیه کلیدی =====
            })),
          };
        } else if (data[field] && typeof data[field] === "object") {
          data[field] = {
            create: {
              ...data[field],
              ...(context?.workspaceId && { workspaceId: context.workspaceId }),
            },
          };
        }
      }
    }
    // منطق connects شما بدون تغییر باقی می‌ماند
    if (this.connect && this.connect.length > 0) {
      for (const field of this.connect) {
        if (
          data[field] &&
          typeof data[field] === "object" &&
          "id" in data[field]
        ) {
          data[`${field}Id`] = data[field].id;
          delete data[field];
        }
      }
    }
    return data;
  }
}

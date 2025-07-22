// مسیر فایل: src/@Server/Http/Service/BaseService.ts

import prisma from "@/lib/prisma";
import { z } from "zod";
import { ValidationException } from "../../Exceptions/BaseException";
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

  /**
   * Validate data against a schema
   */
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

  /**
   * Get all records with pagination and filtering
   */
  async getAll(
    params: FullQueryParams = { page: 1, limit: 10 }
  ): Promise<PaginationResult<T>> {
    params.searchFields = this.searchableFields;
    const defaultFilter = this.defaultFilter;
    params.filters = { ...params.filters, ...defaultFilter };

    return this.repository.findAll(params);
  }

  /**
   * Get a record by ID
   */
  async getById(id: number | string, params: SingleParams = {}): Promise<T> {
    return this.repository.findById(id, params);
  }

  /**
   * Get records by specific field
   */
  async getBy(field: string, value: any, include: any = {}): Promise<T[]> {
    return this.repository.findBy(field, value, include);
  }

  /**
   * Get one record by specific field
   */
  async getOneBy(
    field: string,
    value: any,
    include: any = {}
  ): Promise<T | null> {
    return this.repository.findOneBy(field, value, include);
  }

  /**
   * Create a new record with validation and hooks
   */
  async create(
    data: any,
    context: AuthContext,
    isOwnedByUser: boolean = false
  ): Promise<T> {
    if (this.createSchema) {
      data = this.validate(this.createSchema, data);
    }
    data = await this.processDynamicFields(data);

    // ===== شروع اصلاحیه کلیدی =====
    // تزریق خودکار شناسه‌ها از context امن سرور
    if (context.workspaceId) {
      data.workspaceId = context.workspaceId;
    }

    // userId را فقط زمانی اضافه می‌کنیم که این موجودیت متعلق به یک کاربر خاص باشد (own = true)
    if (isOwnedByUser && context.user) {
      data.userId = context.user.id;
    }
    // ===== پایان اصلاحیه کلیدی =====

    if (this.beforeCreate) {
      data = await this.beforeCreate(data, context);
    }

    const entity = await this.repository.create(data);

    if (this.afterCreate) {
      await this.afterCreate(entity, data);
    }
    return entity;
  }

  /**
   * Create multiple records with validation
   */
  async createMany(data: any[]): Promise<{ count: number }> {
    if (this.createSchema) {
      data = data.map((item) => this.validate(this.createSchema, item));
    }

    return this.repository.createMany(data);
  }

  /**
   * Update a record with validation and hooks
   */
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

  /**
   * Update a record with validation and hooks (PUT method variant)
   */
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
      userId: (entityData as any).userId,
      workspaceId: (entityData as any).workspaceId,
      notified: false,
      status: "PENDING",
    };

    const entity = await prisma.reminder.create({ data: reminderData });
    return entity;
  }

  /**
   * Update multiple records with validation
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    if (this.updateSchema) {
      data = this.validate(this.updateSchema, data);
    }
    return this.repository.updateMany(where, data);
  }

  /**
   * Upsert a record with validation
   */
  async upsert(where: any, create: any, update: any): Promise<T> {
    if (this.createSchema) {
      create = this.validate(this.createSchema, create);
    }
    if (this.updateSchema) {
      update = this.validate(this.updateSchema, update);
    }
    return this.repository.upsert(where, create, update);
  }

  /**
   * Delete a record with hooks
   */
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

  /**
   * Delete multiple records
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return this.repository.deleteMany(where);
  }

  /**
   * Check if a record exists
   */
  async exists(where: any): Promise<boolean> {
    return this.repository.exists(where);
  }

  /**
   * Count records
   */
  async count(where: any = {}): Promise<number> {
    return this.repository.count(where);
  }

  /**
   * Update status with hooks and notification
   */
  async updateStatus(
    id: number,
    statusId: number,
    note?: string,
    sendSms?: boolean,
    metadata: any = {}
  ): Promise<T> {
    const entity = await this.getById(id, {
      include: {
        status: true,
      },
    });
    const oldStatus = (entity as any).status.name;

    await this.repository.update(id, {
      statusId,
      note,
    });

    const updatedEntity = await this.getById(id, {
      include: {
        status: true,
      },
    });
    const newStatus = (updatedEntity as any).status.name;

    if (this.afterStatusChange) {
      await this.afterStatusChange(updatedEntity, {
        sendSms,
        note,
        oldStatus,
        newStatus,
      });
    }

    return updatedEntity;
  }

  /**
   * Link related records
   */
  async link(
    id: number | string,
    relation: string,
    relatedIds: number[] | string[]
  ): Promise<T> {
    return this.repository.link(id, relation, relatedIds);
  }

  /**
   * Unlink related records
   */
  async unlink(
    id: number | string,
    relation: string,
    relatedIds: number[] | string[]
  ): Promise<T> {
    return this.repository.unlink(id, relation, relatedIds);
  }

  protected async processDynamicFields(
    data: any,
    update: boolean = false
  ): Promise<any> {
    if (this.relations && this.relations.length > 0) {
      for (const field of this.relations) {
        if (data[field] && Array.isArray(data[field])) {
          data[field] = {
            create: data[field].map((item: any) => ({ ...item })),
          };
        } else if (data[field] && typeof data[field] === "object") {
          data[field] = { create: data[field] };
        }
      }
    }
    if (this.connect && this.connect.length > 0) {
      for (const field of this.connect) {
        if (data[field] && Array.isArray(data[field])) {
          if (update) {
            data[field] = {
              set: data[field].map((item: any) => ({
                id: parseInt(item.id.toString()),
              })),
            };
          } else {
            data[field] = {
              connect: data[field].map((item: any) => ({
                id: parseInt(item.id.toString()),
              })),
            };
          }
        } else if (data[field] && typeof data[field] === "object") {
          data[field] = {
            connect: { id: parseInt(data[field].id.toString()) },
          };
        }
      }
    }
    return data;
  }
}

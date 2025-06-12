import prisma from "@/lib/prisma";
import { z } from "zod";
import { ValidationException } from "../../Exceptions/BaseException";
import {
  FullQueryParams,
  PaginationResult,
  ServiceResult,
  SingleParams,
  StatusChangeEvent,
} from "../../types";
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
  protected beforeCreate?: (data: any) => Promise<any>;
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
    // Ensure searchFields are set if search is provided
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
  async create(data: any): Promise<T> {
    if (this.createSchema) {
      data = this.validate(this.createSchema, data);
    }
    data = await this.processDynamicFields(data);
    if (this.beforeCreate) {
      data = await this.beforeCreate(data);
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
    console.log("update", data);
    if (this.updateSchema) {
      data = this.validate(this.updateSchema, data);
    }

    // Execute beforeUpdate hook if exists
    if (this.beforeUpdate) {
      data = await this.beforeUpdate(id, data);
    }

    data = await this.processDynamicFields(data, true);

    // Update the record
    const entity = await this.repository.update(id, data);

    // Execute afterUpdate hook if exists
    if (this.afterUpdate) {
      await this.afterUpdate(entity);
    }

    return entity;
  }

  /**
   * Update a record with validation and hooks
   */
  async put(id: number, data: any): Promise<T> {
    // if (this.updateSchema) {
    //   data = this.validate(this.updateSchema, data);
    // }

    // // Execute beforeUpdate hook if exists
    // if (this.beforeUpdate) {
    //   data = await this.beforeUpdate(id, data);
    // }

    data = await this.processDynamicFields(data);

    // Update the record
    const entity = await this.repository.put(id, data);

    // Execute afterUpdate hook if exists
    // if (this.afterUpdate) {
    //   await this.afterUpdate(entity);
    // }

    return entity;
  }

  async createReminder(id: number, data: any) {
    const entityData = await this.repository.findById(id);
    console.log("entityData", entityData);

    const rawDueDate = data.dueDate; // "2025-05-30T01:58"
const dueDate = new Date(rawDueDate); // Converts to valid Date object


    data = {
      title: data.title,
      description: data.description,
      dueDate,
      type: this.repository.getModelName(),
      entityId: (entityData as any).id,
      entityType: this.repository.getModelName(),
      userId: (entityData as any).userId,
      notified: false,
      status: "PENDING",
    };

    console.log("newReminder", data);

    const entity = await prisma.reminder.create({data})

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
  async upsert(
    where: any,
    create: any,
    update: any,
    createSchema?: z.ZodType<any>,
    updateSchema?: z.ZodType<any>
  ): Promise<T> {
    if (createSchema) {
      create = this.validate(createSchema, create);
    }
    if (updateSchema) {
      update = this.validate(updateSchema, update);
    }
    return this.repository.upsert(where, create, update);
  }

  /**
   * Delete a record with hooks
   */
  async delete(id: number | string): Promise<T> {
    // Execute beforeDelete hook if exists
    if (this.beforeDelete) {
      await this.beforeDelete(id);
    }

    // Delete the record
    const entity = await this.repository.delete(id);

    // Execute afterDelete hook if exists
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
   * Get distinct values for a field
   */
  async distinct(field: string, where: any = {}): Promise<any[]> {
    return this.repository.distinct(field, where);
  }

  /**
   * Perform aggregations
   */
  async aggregate(where: any = {}, aggregations: any = {}): Promise<any> {
    return this.repository.aggregate(where, aggregations);
  }

  /**
   * Group by a field
   */
  async groupBy(
    by: string[],
    where: any = {},
    aggregations: any = {}
  ): Promise<any[]> {
    return this.repository.groupBy(by, where, aggregations);
  }

  /**
   * Execute a transaction
   */
  async transaction<R>(callback: (tx: any) => Promise<R>): Promise<R> {
    return this.repository.transaction(callback);
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

    // Update the status
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

    // Execute afterStatusChange hook if exists
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
   * Create notification for status change
   */
  protected async createStatusChangeNotification(
    userId: number,
    entityId: number | string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        title: "تغییر وضعیت",
        message: `وضعیت درخواست شما از ${oldStatus} به ${newStatus} تغییر کرد.`,
        requestId: parseInt(entityId.toString()),

        // metadata: { // TODO
        //   entityId,
        //   oldStatus,
        //   newStatus
        // }
      },
    });
  }

  /**
   * Process dynamic fields and relations
   */

  /**
   * Format service result
   */
  protected formatResult<R>(data?: R, message?: string): ServiceResult<R> {
    return {
      success: true,
      data,
      message,
    };
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

  /**
   * Format error result
   */
  protected formatError(error: string): ServiceResult<never> {
    return {
      success: false,
      error,
    };
  }

  protected async processDynamicFields(
    data: any,
    update: boolean = false
  ): Promise<any> {
    if (this.relations && this.relations.length > 0) {
      for (const field of this.relations) {
        if (data[field] && Array.isArray(data[field])) {
          data[field] = {
            create: data[field].map((item: any) => ({
              ...item,
              // Add any additional processing for relation items
            })),
          };
        } else if (data[field] && typeof data[field] === "object") {
          // Handle single object relations
          data[field] = {
            create: data[field],
          };
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
            connect: {
              id: parseInt(data[field].id.toString()),
            },
          };
        }
      }
    }

    return data;
  }
}

// مسیر فایل: src/@Server/Http/Repository/BaseRepository.ts

import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { NotFoundException } from "../../Exceptions/BaseException";
import {
  FullQueryParams,
  PaginationResult,
  SingleParams,
  TransactionClient,
} from "../../types";

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;
  protected searchableFields: string[] = [];
  protected relations: string[] = [];
  protected defaultOrderBy: Record<string, "asc" | "desc"> = {
    createdAt: "desc",
  };
  protected defaultInclude: Record<string, boolean | object> = {};

  constructor(modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Get the Prisma model
   */
  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Find all records with pagination and advanced filtering
   */
  async findAll(
    params: FullQueryParams = { page: 1, limit: 10 }
  ): Promise<PaginationResult<T>> {
    const {
      page = 1,
      limit = 10,
      filters = {}, // این فیلتر اکنون شامل workspaceId است
      orderBy = params.orderBy || this.defaultOrderBy,
      include = this.defaultInclude,
      search = "",
      searchFields = this.searchableFields,
    } = params;

    // ===== شروع اصلاحیه کلیدی =====
    // ما دیگر QueryBuilder داخلی را از صفر نمی‌سازیم.
    // به جای آن، از آبجکت `filters` که توسط BaseController ساخته شده و حاوی فیلتر امن workspaceId است، مستقیماً استفاده می‌کنیم.
    const where = { ...filters };
    if (search && searchFields && searchFields.length > 0) {
      where.OR = searchFields.map((field) => ({
        [field]: { contains: search, mode: "insensitive" },
      }));
    }
    // ===== پایان اصلاحیه کلیدی =====

    const [data, total] = await Promise.all([
      this.model.findMany({
        where, // استفاده مستقیم از where امن‌شده
        orderBy: orderBy,
        include: include,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.model.count({ where }), // استفاده مستقیم از where امن‌شده
    ]);

    return {
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  /**
   * Find a record by ID with dynamic includes
   */
  async findById(id: number | string, params: SingleParams = {}): Promise<T> {
    const { include = this.defaultInclude, filters } = params;
    const where = { id: typeof id === "string" ? parseInt(id) : id };

    const record = await this.model.findUnique({
      where: { ...where, ...filters }, // فیلتر workspaceId اینجا هم اعمال می‌شود
      include,
    });

    if (!record) {
      throw new NotFoundException(`${this.modelName} not found`);
    }

    return record;
  }

  /**
   * Find records by specific field with dynamic includes
   */
  async findBy(
    field: string,
    value: any,
    include: any = this.defaultInclude
  ): Promise<T[]> {
    return this.model.findMany({
      where: { [field]: value },
      include,
    });
  }

  /**
   * Find first record by specific field with dynamic includes
   */
  async findOneBy(
    field: string,
    value: any,
    include: any = this.defaultInclude
  ): Promise<T | null> {
    return this.model.findFirst({
      where: { [field]: value },
      include,
    });
  }

  /**
   * Create a new record
   */
  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  /**
   * Create multiple records
   */
  async createMany(data: any[]): Promise<{ count: number }> {
    return this.model.createMany({ data });
  }

  /**
   * Update a record
   */
  async update(id: number, data: any): Promise<T> {
    return this.model.update({
      where: { id: parseInt(id.toString()) },
      data,
    });
  }
  /**
   * Update a record (PUT variant)
   */
  async put(id: number, data: any): Promise<T> {
    return this.model.update({
      where: { id: parseInt(id.toString()) },
      data,
    });
  }

  /**
   * Update multiple records
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return this.model.updateMany({
      where,
      data,
    });
  }

  /**
   * Upsert a record
   */
  async upsert(where: any, create: any, update: any): Promise<T> {
    return this.model.upsert({
      where,
      create,
      update,
    });
  }

  /**
   * Delete a record
   */
  async delete(id: number | string): Promise<T> {
    try {
      return await this.model.delete({
        where: { id: typeof id === "string" ? parseInt(id) : id },
      });
    } catch (error) {
      throw new NotFoundException(`${this.modelName} not found`);
    }
  }

  /**
   * Delete multiple records
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return this.model.deleteMany({
      where,
    });
  }

  /**
   * Check if a record exists
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Count records
   */
  async count(where: any = {}): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * Execute a transaction
   */
  async transaction<R>(
    callback: (tx: TransactionClient) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(callback);
  }

  /**
   * Link related records
   */
  async link(
    id: number | string,
    relation: string,
    relatedIds: number[] | string[]
  ): Promise<T> {
    return this.model.update({
      where: { id: typeof id === "string" ? parseInt(id) : id },
      data: {
        [relation]: {
          connect: relatedIds.map((relatedId) => ({
            id: typeof relatedId === "string" ? parseInt(relatedId) : relatedId,
          })),
        },
      },
    });
  }

  /**
   * Unlink related records
   */
  async unlink(
    id: number | string,
    relation: string,
    relatedIds: number[] | string[]
  ): Promise<T> {
    return this.model.update({
      where: { id: typeof id === "string" ? parseInt(id) : id },
      data: {
        [relation]: {
          disconnect: relatedIds.map((relatedId) => ({
            id: typeof relatedId === "string" ? parseInt(relatedId) : relatedId,
          })),
        },
      },
    });
  }

  getModelName() {
    return this.modelName;
  }
}

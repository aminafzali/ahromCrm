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
import { QueryBuilder } from "../Helper/QueryBuilder";

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
    // ===== لاگ ردیابی ۵: بررسی فیلترهای دریافتی در ریپازیتوری =====
    console.log(
      `%c[SERVER - BaseRepository] 🟠 Received filters in findAll:`,
      "color: #fd7e14; font-weight: bold;",
      filters
    );
    // ============================================================

    // ===== شروع اصلاحیه کلیدی و نهایی =====
    // ما QueryBuilder را می‌سازیم، اما فیلترهای امن (شامل workspaceId) را به عنوان پایه به آن می‌دهیم.
    const queryBuilder = new QueryBuilder();
    queryBuilder.setWhere(filters); // این خط تضمین می‌کند که workspaceId همیشه به عنوان شرط پایه اعمال شود.

    // حالا منطق جستجو را به فیلترهای موجود اضافه می‌کنیم (بدون اینکه فیلترهای قبلی را از بین ببرد)
    if (search && searchFields && searchFields.length > 0) {
      queryBuilder.search(searchFields, search);
    }

    // بقیه تنظیمات بدون تغییر باقی می‌مانند
    queryBuilder.setOrderBy(orderBy);
    queryBuilder.setInclude(include);
    queryBuilder.setPagination(page, limit);

    const query = queryBuilder.build();
    // ===== پایان اصلاحیه کلیدی و نهایی =====

    // ===== لاگ ردیابی ۶: بررسی شرط WHERE نهایی قبل از ارسال به Prisma =====
    console.log(
      `%c[SERVER - BaseRepository] 🔴 Final 'where' clause for Prisma:`,
      "color: #dc3545; font-weight: bold;",
      JSON.stringify(query.where, null, 2)
    );
    // =====================================================================

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: query.where,
        orderBy: query.orderBy,
        include: query.include,
        skip: query.skip,
        take: query.take,
      }),
      this.model.count({ where: query.where }),
    ]);
    // ===== لاگ ردیابی ۵: بررسی داده‌های خام بازگشتی از Prisma =====
    console.log(
      `%c[SERVER - BaseRepository] 📦 Raw data fetched from DB (Count: ${data.length}):`,
      "color: #dc3545; font-weight: bold;",
      data
    );
    console.log(
      `%c[SERVER - BaseRepository] 🔢 Total count from DB: ${total}`,
      "color: #dc3545; font-weight: bold;"
    );
    // ==============================================================

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
    // فیلتر workspaceId اینجا هم به درستی اعمال می‌شود
    const where = {
      id: typeof id === "string" ? parseInt(id) : id,
      ...filters,
    };

    const record = await this.model.findUnique({
      where: where,
      include,
    });

    if (!record) {
      throw new NotFoundException(`${this.modelName} not found`);
    }

    return record;
  }

  // ... تمام متدهای دیگر شما (create, update, delete, etc.) بدون تغییر باقی می‌مانند ...

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

  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async createMany(data: any[]): Promise<{ count: number }> {
    return this.model.createMany({ data });
  }

  async update(id: number, data: any): Promise<T> {
    return this.model.update({
      where: { id: parseInt(id.toString()) },
      data,
    });
  }

  async put(id: number, data: any): Promise<T> {
    return this.model.update({
      where: { id: parseInt(id.toString()) },
      data,
    });
  }

  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return this.model.updateMany({ where, data });
  }

  async upsert(where: any, create: any, update: any): Promise<T> {
    return this.model.upsert({ where, create, update });
  }

  async delete(id: number | string): Promise<T> {
    try {
      return await this.model.delete({
        where: { id: typeof id === "string" ? parseInt(id) : id },
      });
    } catch (error) {
      throw new NotFoundException(`${this.modelName} not found`);
    }
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return this.model.deleteMany({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async count(where: any = {}): Promise<number> {
    return this.model.count({ where });
  }

  async transaction<R>(
    callback: (tx: TransactionClient) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(callback);
  }

  getModelName() {
    return this.modelName;
  }

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
}

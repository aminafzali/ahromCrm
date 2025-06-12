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
      filters = {},
      orderBy = params.orderBy || this.defaultOrderBy,
      include = this.defaultInclude,
      search = "",
      searchFields = this.searchableFields,
    } = params;

    // Build query using QueryBuilder
    const queryBuilder = new QueryBuilder();

    // Set basic filters
    queryBuilder.setWhere(filters);

    // Add search functionality if search term is provided
    if (search && searchFields.length > 0) {
      queryBuilder.search(searchFields, search);
    }

    // Set ordering
    queryBuilder.setOrderBy(orderBy);

    // Set includes
    queryBuilder.setInclude(include);

    // Set pagination
    queryBuilder.setPagination(page, limit);

    // Build the query
    const query = queryBuilder.build();
    // Execute query
    const [data, total] = await Promise.all([
      this.model.findMany({
        where: query.where,
        orderBy: orderBy,
        include: query.include,
        skip: query.skip,
        take: query.take,
      }),
      this.model.count({ where: query.where }),
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
      where: { ...where, ...params.filters },
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
    const client = this.model;
    return client.create({ data });
  }

  /**
   * Create multiple records
   */
  async createMany(data: any[]): Promise<{ count: number }> {
    const client = this.model;
    return client.createMany({ data });
  }

  /**
   * Update a record
   */
  async update(id: number, data: any): Promise<T> {
    const client = this.model;
    return await client.update({
      where: { id: parseInt(id.toString()) },
      data,
    });
  }
  /**
   * Update a record
   */
  async put(id: number, data: any): Promise<T> {
    const client = this.model;
    return await client.update({
      where: { id: parseInt(id.toString()) },
      data,
    });
  }

  /**
   * Update multiple records
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    const client = this.model;
    return client.updateMany({
      where,
      data,
    });
  }

  /**
   * Upsert a record
   */
  async upsert(where: any, create: any, update: any): Promise<T> {
    const client = this.model;
    return client.upsert({
      where,
      create,
      update,
    });
  }

  /**
   * Delete a record
   */
  async delete(id: number | string): Promise<T> {
    const client = this.model;
    try {
      return await client.delete({
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
    const client = this.model;
    return client.deleteMany({
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
   * Get distinct values for a field
   */
  async distinct(field: string, where: any = {}): Promise<any[]> {
    return this.model
      .findMany({
        where,
        select: { [field]: true },
        distinct: [field],
      })
      .then((results: any[]) => results.map((r) => r[field]));
  }

  /**
   * Perform aggregations
   */
  async aggregate(where: any = {}, aggregations: any = {}): Promise<any> {
    return this.model.aggregate({
      where,
      ...aggregations,
    });
  }

  /**
   * Group by a field
   */
  async groupBy(
    by: string[],
    where: any = {},
    aggregations: any = {}
  ): Promise<any[]> {
    return this.model.groupBy({
      by,
      where,
      ...aggregations,
    });
  }
  /**
   * Link related records
   */
  async link(
    id: number | string,
    relation: string,
    relatedIds: number[] | string[]
  ): Promise<T> {
    const client = this.model;
    return client.update({
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
    const client = this.model;

    return client.update({
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

  getModelName(){
    return this.modelName;
  }
}

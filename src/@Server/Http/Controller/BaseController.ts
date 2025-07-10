import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import {
  BadRequestException,
  BaseException,
  NotFoundException,
  ValidationException,
} from "../../Exceptions/BaseException";
import { BaseService } from "../Service/BaseService";

export abstract class BaseController<T> {
  protected service: BaseService<T>;
  protected include?: Record<string, boolean | object> = {};
  protected own?: boolean = true;
  protected mustLoggedIn?: boolean = false;
  protected defaultOrderBy: Record<string, "asc" | "desc"> = {
    createdAt: "desc",
  };

  constructor(
    service: BaseService<T>,
    include?: Record<string, boolean | object>,
    own?: boolean
  ) {
    this.service = service;
    this.include = include;
    this.own = own;
  }

  /**
   * Parse query parameters from request
   */
  protected parseQueryParams(req: NextRequest): any {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || undefined;
    const orderField = searchParams.get("orderBy") || "createdAt";
    const orderDirection =
      searchParams.get("orderDirection") === "asc" ? "asc" : "desc";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const filters: Record<string, any> = {};
    const orderBy: Record<string, "asc" | "desc"> = {
      [orderField]: orderDirection,
    };
    let dynamicInclude = { ...this.include };

    // Process all query parameters for filters
    for (const key of searchParams.keys()) {
      if (
        ![
          "page",
          "limit",
          "search",
          "orderBy",
          "sort",
          "include",
          "orderDirection",
          "startDate",
          "endDate",
        ].includes(key)
      ) {
        const value = searchParams.get(key);
        if (value) {
          if (key === "labels" || key === "groups") {
            filters[key] = { some: { id: parseInt(value) } }; // مقدار را به عدد تبدیل کن
          } else if (
            key === "statusId" ||
            key === "serviceTypeId" ||
            key === "categoryId" ||
            key === "brandId" ||
            key === "deviceTypeId" ||
            key === "actualServiceId"   
          ) {
            filters[key] = parseInt(value); // مقدار را به عدد تبدیل کن
          } else {
            filters[key] = value;
          }
        }
      }
    }

    // Set order by
    // orderBy[orderField] = orderDirection as "asc" | "desc";

    // Process include parameter
    if (searchParams.has("include")) {
      try {
        dynamicInclude = JSON.parse(searchParams.get("include")!);
      } catch (error) {
        throw new BadRequestException("Invalid include format");
      }
    }

    return {
      page,
      limit,
      filters,
      search,
      orderBy,
      include: dynamicInclude,
      dateRange: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Get all records with pagination and filtering
   */
  async getAll(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const u = await AuthProvider.isAuthenticated(req, this.mustLoggedIn);
      const params = this.parseQueryParams(req);

      // Apply date range filter if provided
      if (params.dateRange.startDate || params.dateRange.endDate) {
        params.filters.createdAt = {};
        if (params.dateRange.startDate) {
          params.filters.createdAt.gte = new Date(params.dateRange.startDate);
        }
        if (params.dateRange.endDate) {
          params.filters.createdAt.lte = new Date(params.dateRange.endDate);
        }
      }

      if (this.own) {
        if (u.role === "USER") {
          params.filters.userId = u.id;
        }
      }

      console.log("params", params);

      const data = await this.service.getAll(params);
      return this.success(data);
    });
  }

  /**
   * Get a record by ID
   */
  async getById(req: NextRequest, id: number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const u = await AuthProvider.isAuthenticated(req);
      const filters = {};
      if (this.own) {
        if (u.role === "USER") {
          filters["userId"] = u.id;
        }
      }
      const entity = await this.service.getById(id, {
        include: this.include,
        filters,
      });
      if (!entity) {
        throw new NotFoundException("Entity not found");
      }

      return this.success(entity);
    });
  }

  /**
   * Create a new record
   */
  async create(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      await AuthProvider.isAuthenticated(req);
      const body = await req.json();
      try {
        const data = await this.service.create(body);
        return this.created({
          message: "Entity created successfully",
          data,
        });
      } catch (error) {
        if (error instanceof ValidationException) {
          throw error;
        }
        throw error;
        throw new BadRequestException("Invalid input data");
      }
    });
  }

  /**
   * Update a record
   */
  async update(req: NextRequest, id: number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      await AuthProvider.isAdmin(req);
      const body = await req.json();
      try {
        const data = await this.service.update(id, body);
        return this.success({
          message: "Entity updated successfully",
          data,
        });
      } catch (error) {
        if (error instanceof ValidationException) {
          throw error;
        }
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException("Invalid input data");
      }
    });
  }

  /**
   * Update a record
   */
  async put(req: NextRequest, id: number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      await AuthProvider.isAdmin(req);
      const body = await req.json();
      try {
        const data = await this.service.put(id, body);
        return this.success({
          message: "Entity updated successfully",
          data,
        });
      } catch (error) {
        if (error instanceof ValidationException) {
          throw error;
        }
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException("Invalid input data");
      }
    });
  }

  /**
   * Delete a record
   */
  async delete(req: NextRequest, id: number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      await AuthProvider.isAdmin(req);
      try {
        await this.service.delete(id);
        return this.noContent();
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException("Could not delete entity");
      }
    });
  }

  /**
   * update Status
   */
  async updateStatus(req: NextRequest, id: number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      await AuthProvider.isAdmin(req);
      const body = await req.json();
      try {
        await this.service.updateStatus(
          id,
          body.statusId,
          body.note,
          body.sendSms
        );
        return this.success("با موفقیت به روز رسانی شد", 201);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException("Could not delete entity");
      }
    });
  }

  /**
   * Delete a record
   */
  async createReminder(req: NextRequest, id: number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      await AuthProvider.isAdmin(req);
      const body = await req.json();
      try {
        await this.service.createReminder(id, body);
        return this.success("با موفقیت یاد آور ساخته شد", 201);
      } catch (error) {
        console.log(error);
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException("Could not ");
      }
    });
  }

  /**
   * Bulk operations
   */
  async bulk(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      await AuthProvider.isAdmin(req);
      const body = await req.json();

      if (!body.operation || !body.data) {
        throw new BadRequestException("Operation and data are required");
      }

      let result;

      switch (body.operation) {
        case "createMany":
          result = await this.service.createMany(body.data);
          break;
        case "updateMany":
          if (!body.where) {
            throw new BadRequestException(
              "Where clause is required for updateMany"
            );
          }
          result = await this.service.updateMany(body.where, body.data);
          break;
        case "deleteMany":
          if (!body.where) {
            throw new BadRequestException(
              "Where clause is required for deleteMany"
            );
          }
          result = await this.service.deleteMany(body.where);
          break;
        default:
          throw new BadRequestException("Invalid operation");
      }

      return this.success({
        message: `Bulk operation ${body.operation} completed successfully`,
        result,
      });
    });
  }

  /**
   * Execute an action with error handling
   */
  protected async executeAction(
    req: NextRequest,
    action: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      return await action();
    } catch (error) {
      // console.error(error);
      return this.handleException(error);
    }
  }

  /**
   * Handle exceptions
   */
  protected handleException(error: unknown): NextResponse {
    // --- لطفاً فقط این یک خط را اضافه کنید ---
    console.error("====== SERVER ERROR (BaseController) ======", error);
    // --- پایان تغییر ---

    if (error instanceof BaseException) {
      return NextResponse.json(
        { error: error.message, ...(error.errors && { errors: error.errors }) },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }

  /**
   * Return a success response
   */
  protected success<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
  }

  /**
   * Return a created response
   */
  protected created<T>(data: T): NextResponse {
    return this.success(data, 201);
  }

  /**
   * Return a no content response
   */
  protected noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Link an entity to another (e.g., add a tag to a post)
   */
  async link(req: NextRequest, id: number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      await AuthProvider.isAdmin(req);
      const body = await req.json();

      if (!body.relation || !body.relatedIds) {
        throw new BadRequestException("Relation and relatedIds are required");
      }

      try {
        const data = await this.service.link(
          id,
          body.relation,
          body.relatedIds
        );
        return this.success({
          message: "Entities linked successfully",
          data,
        });
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException("Could not link entities");
      }
    });
  }

  /**
   * Unlink an entity from another (e.g., remove a tag from a post)
   */
  async unlink(req: NextRequest, id: number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      await AuthProvider.isAdmin(req);
      const body = await req.json();

      if (!body.relation || !body.relatedIds) {
        throw new BadRequestException("Relation and relatedIds are required");
      }

      try {
        const data = await this.service.unlink(
          id,
          body.relation,
          body.relatedIds
        );
        return this.success({
          message: "Entities unlinked successfully",
          data,
        });
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException("Could not unlink entities");
      }
    });
  }
}

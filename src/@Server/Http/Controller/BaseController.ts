// مسیر فایل: src/@Server/Http/Controller/BaseController.ts

import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import {
  BadRequestException,
  BaseException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  ValidationException,
} from "../../Exceptions/BaseException";
import { BaseService } from "../Service/BaseService";
import { Role, User, WorkspaceUser } from ".prisma/client";

// یک تایپ برای Context که شامل تمام اطلاعات کاربر و فضای کاری است
export type AuthContext = {
  user: User | null;
  workspaceId: number | null;
  role: Role | null;
  workspaceUser: (WorkspaceUser & { role: Role }) | null;
};

export abstract class BaseController<T extends { userId?: number | null }> {
  protected service: BaseService<T>;
  protected include: Record<string, boolean | object>;
  protected own: boolean;
  protected mustLoggedIn: boolean;

  constructor(
    service: BaseService<T>,
    include: Record<string, boolean | object> = {},
    own: boolean = true,
    mustLoggedIn: boolean = true
  ) {
    this.service = service;
    this.include = include;
    this.own = own;
    this.mustLoggedIn = mustLoggedIn;
  }

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

    for (const [key, value] of searchParams.entries()) {
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
        if (value && value !== "all") {
          if (key.endsWith("Id")) {
            filters[key] = parseInt(value);
          } else {
            filters[key] = value;
          }
        }
      }
    }

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
      dateRange: { startDate, endDate },
    };
  }

  async getAll(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const context = await AuthProvider.isAuthenticated(
        req,
        this.mustLoggedIn
      );
      if (this.mustLoggedIn && !context.workspaceId)
        throw new BadRequestException("Workspace not identified.");

      const params = this.parseQueryParams(req);

      if (context.workspaceId) {
        params.filters.workspaceId = context.workspaceId;
      }

      if (this.own && context.role?.name === "USER") {
        if (!context.user)
          throw new UnauthorizedException("User context is required.");
        params.filters.userId = context.user.id;
      }

      if (params.dateRange.startDate || params.dateRange.endDate) {
        params.filters.createdAt = {};
        if (params.dateRange.startDate) {
          params.filters.createdAt.gte = new Date(params.dateRange.startDate);
        }
        if (params.dateRange.endDate) {
          params.filters.createdAt.lte = new Date(params.dateRange.endDate);
        }
      }

      const data = await this.service.getAll(params);
      return this.success(data);
    });
  }

  async getById(req: NextRequest, id: string | number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const context = await AuthProvider.isAuthenticated(req);
      if (!context.workspaceId || !context.user)
        throw new UnauthorizedException(
          "User and Workspace context are required."
        );

      const filters: any = { workspaceId: context.workspaceId };

      if (this.own && context.role?.name === "USER") {
        filters.userId = context.user.id;
      }

      const entity = await this.service.getById(numericId, {
        include: this.include,
        filters,
      });
      if (!entity)
        throw new NotFoundException("Entity not found in this workspace");

      return this.success(entity);
    });
  }

  async create(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const context = await AuthProvider.isAuthenticated(req);
      
      // با این شرط، به تایپ‌اسکریپت اطمینان می‌دهیم که تمام مقادیر مورد نیاز برای ساخت، وجود دارند
      if (!context.workspaceId || !context.user || !context.role || !context.workspaceUser)
        throw new UnauthorizedException(
          "User, Workspace, Role, and WorkspaceUser context are required for creation."
        );

      const body = await req.json();

      // **اصلاحیه کلیدی**: ما یک آبجکت جدید و معتبر می‌سازیم که تایپ آن دقیقاً با چیزی که سرویس انتظار دارد، مطابقت دارد.
      // این کار تداخل بین `null` و `undefined` را به طور کامل حل می‌کند.
      const validServiceContext = {
        user: context.user,
        workspaceId: context.workspaceId,
        role: context.role,
        workspaceUser: context.workspaceUser,
      };
      // TODO: شاید نیاز باشد بیس سرویس اصلاح شود و رول از آن برداشته شود ولی فعلا مهم نیست
      const data = await this.service.create(body, validServiceContext);

      return this.created({ message: "Entity created successfully", data });
    });
  }

  async update(req: NextRequest, id: string | number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const context = await AuthProvider.isAuthenticated(req);
      if (context.role?.name !== "Admin")
        throw new ForbiddenException("Admin access required for update.");
      
      if(!context.workspaceId) throw new BadRequestException("Workspace ID is required for update.");

      await this.service.getById(numericId, {
        filters: { workspaceId: context.workspaceId },
      });

      const body = await req.json();
      const data = await this.service.update(numericId, body);
      return this.success({ message: "Entity updated successfully", data });
    });
  }

  async delete(req: NextRequest, id: string | number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const context = await AuthProvider.isAuthenticated(req);
      
      if(!context.workspaceId || !context.user) throw new BadRequestException("Full context is required for deletion.");

      const entityToDelete = await this.service.getById(numericId, {
        filters: { workspaceId: context.workspaceId },
      });
      if (!entityToDelete)
        throw new NotFoundException("Entity not found in this workspace.");

      if (context.role?.name !== "Admin") {
        if (this.own && entityToDelete.userId !== context.user.id) {
          throw new ForbiddenException(
            "Permission denied to delete this entity."
          );
        }
      }

      await this.service.delete(numericId);
      return this.noContent();
    });
  }

  async updateStatus(
    req: NextRequest,
    id: string | number
  ): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const context = await AuthProvider.isAuthenticated(req);
      if (context.role?.name !== "Admin")
        throw new ForbiddenException(
          "Admin access required for status update."
        );
      
      if(!context.workspaceId) throw new BadRequestException("Workspace ID is required.");

      await this.service.getById(numericId, {
        filters: { workspaceId: context.workspaceId },
      });

      const body = await req.json();
      await this.service.updateStatus(
        numericId,
        body.statusId,
        body.note,
        body.sendSms
      );
      return this.success("با موفقیت به روز رسانی شد", 201);
    });
  }

  async createReminder(
    req: NextRequest,
    id: string | number
  ): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const context = await AuthProvider.isAuthenticated(req);
      if (context.role?.name !== "Admin")
        throw new ForbiddenException(
          "Admin access required to create reminder."
        );
      
      if(!context.workspaceId || !context.user) throw new BadRequestException("Full context is required for reminder.");

      await this.service.getById(numericId, {
        filters: { workspaceId: context.workspaceId },
      });

      const body = await req.json();
      const reminderData = { ...body, workspaceId: context.workspaceId, userId: context.user.id };

      await this.service.createReminder(numericId, reminderData);
      return this.success("با موفقیت یاد آور ساخته شد", 201);
    });
  }

  async bulk(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const context = await AuthProvider.isAuthenticated(req);
      if (context.role?.name !== "Admin")
        throw new ForbiddenException(
          "Admin access required for bulk operations."
        );
      
      if(!context.workspaceId) throw new BadRequestException("Workspace ID is required for bulk operations.");

      const body = await req.json();
      if (!body.operation || !body.data)
        throw new BadRequestException("Operation and data are required");

      const whereWithWorkspace = {
        ...(body.where || {}),
        workspaceId: context.workspaceId,
      };

      let result;
      switch (body.operation) {
        case "createMany":
          const dataWithWorkspace = body.data.map((item: any) => ({
            ...item,
            workspaceId: context.workspaceId,
          }));
          result = await this.service.createMany(dataWithWorkspace);
          break;
        case "updateMany":
          result = await this.service.updateMany(whereWithWorkspace, body.data);
          break;
        case "deleteMany":
          result = await this.service.deleteMany(whereWithWorkspace);
          break;
        default:
          throw new BadRequestException("Invalid bulk operation");
      }
      return this.success({
        message: `Bulk operation ${body.operation} completed successfully`,
        result,
      });
    });
  }

  protected async executeAction(
    req: NextRequest,
    action: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      return await action();
    } catch (error) {
      return this.handleException(error);
    }
  }

  protected handleException(error: unknown): NextResponse {
    console.error("====== SERVER ERROR (BaseController) ======");
    if (error instanceof ValidationException) {
      console.error("Validation Errors:", error.errors);
    } else if (error instanceof Error) {
      console.error("Error Name:", error.name);
      console.error("Error Message:", error.message);
    } else {
      console.error("Caught a non-Error object:", error);
    }

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

  protected success<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
  }
  protected created<T>(data: T): NextResponse {
    return this.success(data, 201);
  }
  protected noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  async link(req: NextRequest, id: string | number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      throw new BadRequestException(
        "Link method is not yet implemented for workspaces."
      );
    });
  }

  async unlink(req: NextRequest, id: string | number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      throw new BadRequestException(
        "Unlink method is not yet implemented for workspaces."
      );
    });
  }
}
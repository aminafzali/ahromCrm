// مسیر فایل: src/@Server/Http/Controller/BaseController.ts

import { Role, User, WorkspaceUser } from ".prisma/client";
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

export type AuthContext = {
  user: User | null;
  workspaceId: number | null;
  role: Role | null;
  workspaceUser: (WorkspaceUser & { role: Role }) | null;
};

export abstract class BaseController<T> {
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

  // ... متدهای parseQueryParams, getAll, getById بدون تغییر ...

  async create(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const context = await AuthProvider.isAuthenticated(req);

      if (
        !context.workspaceId ||
        !context.user ||
        !context.role ||
        !context.workspaceUser
      )
        throw new UnauthorizedException(
          "User, Workspace, Role, and WorkspaceUser context are required for creation."
        );

      const body = await req.json();

      const validServiceContext = {
        user: context.user,
        workspaceId: context.workspaceId,
        role: context.role,
        workspaceUser: context.workspaceUser,
      };

      // ===== شروع اصلاحیه =====
      // فراخوانی متد create اکنون به شکل صحیح و با دو آرگومان انجام می‌شود
      const data = await this.service.create(body, validServiceContext);
      // ===== پایان اصلاحیه =====

      return this.created({ message: "Entity created successfully", data });
    });
  }

  // ... تمام متدهای دیگر (update, delete, bulk, etc.) بدون تغییر باقی می‌مانند ...

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

  /**
   * هوک قابل بازنویسی برای تغییر یا تبدیل فیلترها قبل از ارسال به سرویس.
   * این متد به شما اجازه می‌دهد منطق فیلترینگ سفارشی را بدون بازنویسی کامل getAll پیاده‌سازی کنید.
   * @param params پارامترهای استخراج شده از URL
   * @returns پارامترهای تبدیل شده
   */
  protected transformFilters(params: any): any {
    // به صورت پیش‌فرض، هیچ تغییری اعمال نمی‌شود
    return params;
  }

  async getAll(req: NextRequest): Promise<NextResponse> {
    // متد executeAction برای مدیریت متمرکز خطاها استفاده می‌شود
    return this.executeAction(req, async () => {
      // ===== لاگ ردیابی ۱: شروع پردازش درخواست =====
      console.log(
        `%c[SERVER - BaseController] 🟢 1. Received GET request for: ${req.nextUrl.pathname}`,
        "color: #28a745; font-weight: bold;"
      );
      // console.log(
      //   "[SERVER - BaseController]    Incoming Headers:",
      //   Object.fromEntries(req.headers)
      // );
      // ===============================================

      // ۲. ابتدا context را با AuthProvider دریافت می‌کنیم تا workspaceId از هدر خوانده شود
      const context = await AuthProvider.isAuthenticated(
        req,
        this.mustLoggedIn
      );

      // ===== لاگ ردیابی ۲: بررسی خروجی AuthProvider =====
      // console.log(
      //   `%c[SERVER - BaseController] 🟢 2. AuthProvider Context Result:`,
      //   "color: #28a745; font-weight: bold;",
      //   context
      // );
      // ===============================================

      if (this.mustLoggedIn && !context.workspaceId) {
        // اگر در این مرحله خطا رخ دهد، یعنی هدر X-Workspace-Id ارسال نشده یا معتبر نیست
        throw new BadRequestException("Workspace not identified.");
      }

      // ۳. سپس پارامترهای دیگر (مثل صفحه‌بندی) را از URL می‌خوانیم
      let params = this.parseQueryParams(req);

      // ===== لاگ ردیابی ۳: بررسی پارامترها قبل از اضافه کردن فیلترها =====
      console.log(
        `%c[SERVER - BaseController] 🟢 3. Parsed URL Params:`,
        "color: #28a745; font-weight: bold;",
        params
      );
      // =============================================================

      // ۴. حالا با اطمینان کامل، workspaceId را به فیلترها اضافه می‌کنیم
      if (context.workspaceId) {
        params.filters.workspaceId = context.workspaceId;
      }

      // ۵. منطق فیلتر بر اساس مالکیت (own) را نیز در اینجا اعمال می‌کنیم
      if (this.own && context.role?.name === "USER") {
        if (!context.user)
          throw new UnauthorizedException("User context is required.");
        params.filters.userId = context.user.id;
      }

      // ===== شروع اصلاحیه کلیدی =====
      // قبل از ارسال پارامترها به سرویس، هوک transformFilters را فراخوانی می‌کنیم
      params = this.transformFilters(params);
      // ===== پایان اصلاحیه کلیدی =====

      if (params.dateRange.startDate || params.dateRange.endDate) {
        params.filters.createdAt = {};
        if (params.dateRange.startDate) {
          params.filters.createdAt.gte = new Date(params.dateRange.startDate);
        }
        if (params.dateRange.endDate) {
          params.filters.createdAt.lte = new Date(params.dateRange.endDate);
        }
      }

      // ===== لاگ ردیابی ۴: بررسی پارامترهای نهایی قبل از ارسال به سرویس =====
      console.log(
        `%c[SERVER - BaseController] 🟢 4. Final Params being sent to Service:`,
        "color: #28a745; font-weight: bold;",
        JSON.parse(JSON.stringify(params)) // از JSON برای نمایش بهتر آبجکت‌های تو در تو استفاده می‌کنیم
      );
      // ================================================================

      // ۶. فراخوانی لایه سرویس با پارامترهای امن‌شده
      const data = await this.service.getAll(params);

      // ===== لاگ ردیابی ۵: بررسی داده‌های نهایی قبل از ارسال پاسخ =====
      console.log(
        `%c[SERVER - BaseController] 🟢 5. Final data before sending response to Client:`,
        "color: #28a745; font-weight: bold;",
        data
      );
      // ============================================================

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

  async update(req: NextRequest, id: string | number): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const context = await AuthProvider.isAuthenticated(req);
      if (context.role?.name !== "Admin")
        throw new ForbiddenException("Admin access required for update.");

      if (!context.workspaceId)
        throw new BadRequestException("Workspace ID is required for update.");

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

      if (!context.workspaceId || !context.user)
        throw new BadRequestException("Full context is required for deletion.");

      const entityToDelete = await this.service.getById(numericId, {
        filters: { workspaceId: context.workspaceId },
      });
      if (!entityToDelete)
        throw new NotFoundException("Entity not found in this workspace.");

      if (context.role?.name !== "Admin") {
        if (this.own) {
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
    // ===== شروع لاگ‌های ردیابی =====
    console.log(
      `%c[BaseController - updateStatus] 1. Received PATCH request for ID: ${id}`,
      "color: #007acc; font-weight: bold;"
    );
    // =============================

    return this.executeAction(req, async () => {
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;

      const context = await AuthProvider.isAuthenticated(req);
      console.log(
        `%c[BaseController - updateStatus] 2. AuthProvider Context:`,
        "color: #007acc;",
        context
      );

      if (context.role?.name !== "Admin")
        throw new ForbiddenException(
          "Admin access required for status update."
        );

      if (!context.workspaceId)
        throw new BadRequestException("Workspace ID is required.");

      console.log(
        `%c[BaseController - updateStatus] 3. Checking entity ownership...`,
        "color: #007acc;"
      );
      await this.service.getById(numericId, {
        filters: { workspaceId: context.workspaceId },
      });
      console.log(
        `%c[BaseController - updateStatus] 4. Ownership check passed.`,
        "color: #28a745;"
      );

      const body = await req.json();
      console.log(
        `%c[BaseController - updateStatus] 5. Received body:`,
        "color: #007acc;",
        body
      );

      console.log(
        `%c[BaseController - updateStatus] 6. Calling service.updateStatus...`,
        "color: #007acc;"
      );
      await this.service.updateStatus(
        numericId,
        body.statusId,
        body.note,
        body.sendSms,
        {}, // metadata
        context,
        this.include
      );

      console.log(
        `%c[BaseController - updateStatus] 7. ✅ Service call successful.`,
        "color: #28a745; font-weight: bold;"
      );
      return this.success("با موفقیت به روز رسانی شد", 200);
    });
  }

  // async updateStatus(
  //   req: NextRequest,
  //   id: string | number
  // ): Promise<NextResponse> {
  //   return this.executeAction(req, async () => {
  //     const numericId = typeof id === "string" ? parseInt(id, 10) : id;
  //     const context = await AuthProvider.isAuthenticated(req);

  //     if (context.role?.name !== "Admin")
  //       throw new ForbiddenException(
  //         "Admin access required for status update."
  //       );

  //     if (!context.workspaceId)
  //       throw new BadRequestException("Workspace ID is required.");

  //     // این خط برای بررسی مالکیت، عالی و ضروری است
  //     await this.service.getById(numericId, {
  //       filters: { workspaceId: context.workspaceId },
  //     });

  //     const body = await req.json();

  //     // ===== شروع اصلاحیه کلیدی =====
  //     // ما آبجکت context را به متد سرویس پاس می‌دهیم
  //     await this.service.updateStatus(
  //       numericId,
  //       body.statusId,
  //       body.note,
  //       body.sendSms,
  //       {}, // metadata
  //       context // context شامل اطلاعات کاربر تغییر دهنده است
  //     );
  //     // ===== پایان اصلاحیه کلیدی =====

  //     return this.success("با موفقیت به روز رسانی شد", 200); // معمولا برای آپدیت از کد 200 استفاده می‌شود
  //   });
  // }

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

      if (!context.workspaceId || !context.user)
        throw new BadRequestException("Full context is required for reminder.");

      await this.service.getById(numericId, {
        filters: { workspaceId: context.workspaceId },
      });

      const body = await req.json();
      const reminderData = {
        ...body,
        workspaceId: context.workspaceId,
        userId: context.user.id,
      };

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

      if (!context.workspaceId)
        throw new BadRequestException(
          "Workspace ID is required for bulk operations."
        );

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
    console.warn("⚠️ Raw error received:", error); // اضافه کن

    let properError: Error;

    try {
      if (error instanceof Error) {
        properError = error;
      } else if (typeof error === "object" && error !== null) {
        properError = new Error("Non-standard error thrown");
        Object.assign(properError, error); // تلاش برای نگه داشتن اطلاعات اضافی
      } else {
        properError = new Error(
          `Non-object error thrown: ${JSON.stringify(error)}`
        );
      }
    } catch (jsonErr) {
      properError = new Error("Error during error handling.");
    }

    console.error("====== SERVER ERROR (BaseController) ======", properError);

    if (properError instanceof ValidationException) {
      console.error("Validation Errors:", (properError as any).errors);
    } else {
      console.error("Error Name:", properError.name);
      console.error("Error Message:", properError.message);
    }

    if (properError instanceof BaseException) {
      return NextResponse.json(
        {
          error: properError.message,
          ...((properError as any).errors && {
            errors: (properError as any).errors,
          }),
        },
        { status: (properError as any).statusCode }
      );
    }

    return NextResponse.json(
      { error: "An unexpected internal server error occurred." },
      { status: 500 }
    );
  }

  protected success<T>(data: T, status: number = 200): NextResponse {
    // ===== لاگ ردیابی ۴: لاگ کردن خود پاسخ =====
    console.log(
      `%c[SERVER - BaseController] ✅ Sending Success Response (Status ${status})`,
      "color: #28a745; font-weight: bold;"
    );
    // ==========================================

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

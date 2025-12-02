// مسیر فایل: src/modules/workspace-users/service/WorkspaceUserServiceApi.ts

import { NotFoundException } from "@/@Server/Exceptions/BaseException";
import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createWorkspaceUserSchema,
  updateWorkspaceUserSchema,
} from "../validation/schema";

// ریپازیتوری سرور به صورت یک کلاس داخلی تعریف می‌شود، دقیقاً مانند ماژول brands
class Repository extends BaseRepository<any> {
  constructor() {
    super("workspaceUser");
  }
}

export class WorkspaceUserServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createWorkspaceUserSchema,
      updateWorkspaceUserSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }

  /**
   * متد create را برای پیاده‌سازی منطق "دعوت عضو جدید" و ترجمه داده‌ها بازنویسی می‌کنیم.
   */
  async create(data: any, context: AuthContext): Promise<any> {
    const validatedData = this.validate(this.createSchema, data);
    const {
      name,
      phone,
      role,
      displayName,
      labels,
      userGroupId, // تغییر از userGroups به userGroupId
      address,
      postalCode,
      province,
      city,
      economicCode,
      registrationNumber,
      nationalId,
      otherPhones,
      bankAccounts,
      description,
    } = validatedData;

    const parseMultiLine = (value?: string | null) =>
      value
        ? value
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean)
        : null;

    const otherPhonesJson = parseMultiLine(otherPhones);
    const bankAccountsJson = parseMultiLine(bankAccounts);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { phone },
        update: { name },
        create: { phone, name },
      });

      const workspaceUser = await tx.workspaceUser.create({
        data: {
          workspaceId: context.workspaceId!,
          userId: user.id,
          // ===== شروع اصلاحیه (ترجمه) =====
          // شناسه را از آبجکت role استخراج کرده و به فیلد roleId پاس می‌دهیم
          roleId: role.id,
          displayName: displayName || name,
          name: displayName || name,
          address,
          postalCode,
          province,
          city,
          economicCode,
          registrationNumber,
          nationalId,
          otherPhones: otherPhonesJson || undefined,
          // فیلد متنی bankAccounts در Zod فقط برای note است و در Prisma نگه‌داری نمی‌شود
          description,

          // برای روابط چند به چند نیز داده‌ها را به فرمت صحیح Prisma ترجمه می‌کنیم
          labels: labels
            ? {
                connect: labels.map((label: { id: number }) => ({
                  id: label.id,
                })),
              }
            : undefined,
          userGroupId: userGroupId || undefined, // تغییر به one-to-one
          // ===== پایان اصلاحیه (ترجمه) =====
        } as any,
        include: include,
      });

      return workspaceUser;
    });
  }

  /**
   * متد update را برای تغییر نقش و پروفایل کاربر بازنویسی می‌کنیم.
   */
  async update(id: number, data: any): Promise<any> {
    console.log("[WorkspaceUserServiceApi] update called with:", {
      id,
      data: JSON.stringify(data, null, 2),
    });

    const validatedData = this.validate(this.updateSchema, data);
    const {
      role,
      displayName,
      labels,
      userGroups,
      address,
      postalCode,
      province,
      city,
      economicCode,
      registrationNumber,
      nationalId,
      otherPhones,
      bankAccounts,
      description,
      userGroupId, // تغییر از userGroups به userGroupId
    } = validatedData;

    console.log("[WorkspaceUserServiceApi] validated data:", {
      role,
      displayName,
      labels: labels
        ? Array.isArray(labels)
          ? labels.length
          : "not array"
        : undefined,
      userGroupId, // تغییر از userGroups به userGroupId
    });

    // داده‌ها را برای Prisma ترجمه می‌کنیم
    const finalData: any = {};

    // displayName و name
    if (displayName !== undefined) {
      finalData.displayName = displayName;
      finalData.name = displayName;
    }

    if (address !== undefined) finalData.address = address;
    if (postalCode !== undefined) finalData.postalCode = postalCode;
    if (province !== undefined) finalData.province = province;
    if (city !== undefined) finalData.city = city;
    if (economicCode !== undefined) finalData.economicCode = economicCode;
    if (registrationNumber !== undefined)
      finalData.registrationNumber = registrationNumber;
    if (nationalId !== undefined) finalData.nationalId = nationalId;

    if (otherPhones !== undefined) {
      const parseMultiLine = (value?: string | null) =>
        value
          ? value
              .split(/\r?\n/)
              .map((s) => s.trim())
              .filter(Boolean)
          : null;
      const otherPhonesJson = parseMultiLine(otherPhones);
      finalData.otherPhones = otherPhonesJson || undefined;
    }

    if (description !== undefined) finalData.description = description;

    // role همیشه باید باشد - اگر در validatedData نیست، از رکورد فعلی استفاده می‌کنیم
    if (role) {
      finalData.roleId = typeof role === "object" && role.id ? role.id : role;
      console.log("[WorkspaceUserServiceApi] role set:", finalData.roleId);
    } else {
      // اگر role نیست، باید از رکورد فعلی بگیریم
      const current = await this.repository.findById(id);
      if (current && (current as any).roleId) {
        finalData.roleId = (current as any).roleId;
        console.log(
          "[WorkspaceUserServiceApi] using existing roleId:",
          finalData.roleId
        );
      } else {
        throw new Error(
          "نقش کاربر مشخص نشده است و نمی‌توان از نقش قبلی استفاده کرد."
        );
      }
    }

    // برای labels: فقط اگر در validatedData هست و set شده، set کن
    if (labels !== undefined) {
      if (labels && typeof labels === "object" && "set" in labels) {
        // اگر labels به صورت { set: [...] } است، مستقیم استفاده کن
        finalData.labels = labels;
      } else if (Array.isArray(labels) && labels.length > 0) {
        finalData.labels = {
          set: labels.map((label: { id: number }) => ({ id: label.id })),
        };
      } else {
        // اگر آرایه خالی است، set خالی می‌کنیم تا روابط قبلی حذف شوند
        finalData.labels = { set: [] };
      }
    }

    // برای userGroup: فقط اگر در validatedData هست، set کن (one-to-one)
    if (userGroupId !== undefined) {
      finalData.userGroupId = userGroupId;
    }

    const workspaceUser = await this.repository.findById(id);
    if (!workspaceUser) {
      throw new NotFoundException("Workspace user not found");
    }

    console.log(
      "[WorkspaceUserServiceApi] finalData before update:",
      JSON.stringify(finalData, null, 2)
    );

    const updated = await this.repository.update(id, finalData);

    console.log(
      "[WorkspaceUserServiceApi] update completed, fetching updated record..."
    );

    // خواندن رکورد به‌روز شده با include کامل برای verification
    const updatedWithRelations = await prisma.workspaceUser.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, name: true } },
        labels: { select: { id: true, name: true } },
        userGroup: { select: { id: true, name: true } },
      },
    });

    console.log("[WorkspaceUserServiceApi] updated record:", {
      roleId: updatedWithRelations?.role?.id,
      roleName: updatedWithRelations?.role?.name,
      labelIds: updatedWithRelations?.labels?.map((l) => l.id),
      labelNames: updatedWithRelations?.labels?.map((l) => l.name),
      groupId: updatedWithRelations?.userGroup?.id,
      groupName: updatedWithRelations?.userGroup?.name,
    });

    return updated;
  }
}

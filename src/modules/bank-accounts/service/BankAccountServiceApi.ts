import { NotFoundException } from "@/@Server/Exceptions/BaseException";
import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createBankAccountSchema,
  updateBankAccountSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("bankAccount");
  }
}

export class BankAccountServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createBankAccountSchema,
      updateBankAccountSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }

  async create(data: any, context: AuthContext): Promise<any> {
    const validated = this.validate(this.createSchema, data);
    const { workspaceUser, isDefaultForReceive, isDefaultForPay, ...rest } =
      validated;

    const workspaceId = context.workspaceId!;

    return (prisma as any).$transaction(async (tx: any) => {
      // اگر این حساب پیش‌فرض دریافتی/پرداختی است، بقیه را غیرفعال کن
      if (isDefaultForReceive) {
        await (tx as any).bankAccount.updateMany({
          where: { workspaceId },
          data: { isDefaultForReceive: false },
        });
      }
      if (isDefaultForPay) {
        await (tx as any).bankAccount.updateMany({
          where: { workspaceId },
          data: { isDefaultForPay: false },
        });
      }

      const created = await (tx as any).bankAccount.create({
        data: {
          ...rest,
          workspaceId,
          workspaceUserId: workspaceUser?.id ?? null,
          isDefaultForReceive: !!isDefaultForReceive,
          isDefaultForPay: !!isDefaultForPay,
        },
        include,
      });

      return created;
    });
  }

  async update(id: number, data: any): Promise<any> {
    const validated = this.validate(this.updateSchema, data);
    const { workspaceUser, isDefaultForReceive, isDefaultForPay, ...rest } =
      validated;

    const existing = await (prisma as any).bankAccount.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException("حساب بانکی یافت نشد");
    }

    return (prisma as any).$transaction(async (tx: any) => {
      if (isDefaultForReceive === true) {
        await (tx as any).bankAccount.updateMany({
          where: { workspaceId: existing.workspaceId },
          data: { isDefaultForReceive: false },
        });
      }
      if (isDefaultForPay === true) {
        await (tx as any).bankAccount.updateMany({
          where: { workspaceId: existing.workspaceId },
          data: { isDefaultForPay: false },
        });
      }

      const updated = await (tx as any).bankAccount.update({
        where: { id },
        data: {
          ...rest,
          workspaceUserId:
            workspaceUser !== undefined && workspaceUser !== null
              ? workspaceUser.id
              : existing.workspaceUserId,
          ...(isDefaultForReceive !== undefined && {
            isDefaultForReceive,
          }),
          ...(isDefaultForPay !== undefined && {
            isDefaultForPay,
          }),
        },
        include,
      });

      return updated;
    });
  }
}

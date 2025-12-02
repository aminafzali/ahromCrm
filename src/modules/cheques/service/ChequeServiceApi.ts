import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { ReminderServiceApi } from "@/modules/reminders/service/ReminderServiceApi";
import { ChequeStatus } from "@prisma/client";
import { connects, relations, searchFileds } from "../data/fetch";
import { createChequeSchema, updateChequeSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Cheque");
  }
}

export class ChequeServiceApi extends BaseService<any> {
  protected reminderService: ReminderServiceApi;

  constructor() {
    super(
      new Repository(),
      createChequeSchema,
      updateChequeSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
    this.reminderService = new ReminderServiceApi();

    // Initialize hooks
    this.afterCreate = this.handleAfterCreate;
    this.beforeStatusChange = this.handleBeforeStatusChange;
    this.afterStatusChange = this.handleAfterStatusChange;
  }

  /**
   * Handle after create hook - ایجاد خودکار Reminder برای چک
   */
  private async handleAfterCreate(entity: any): Promise<void> {
    try {
      // ساخت یادآور خودکار برای سررسید چک
      const reminderData = {
        workspaceId: entity.workspaceId,
        workspaceUser: { id: entity.workspaceUserId },
        title: `سررسید چک شماره ${entity.chequeNumber}`,
        description: this.buildReminderDescription(entity),
        dueDate: entity.dueDate,
        type: "CHEQUE_DUE",
        entityType: "CHEQUE",
        entityId: entity.id,
        chequeId: entity.id,
        status: "PENDING",
        notificationChannels: "ALL",
        isActive: true,
      };

      // ساخت context برای ReminderServiceApi
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: { id: entity.workspaceUserId },
        include: { user: true, role: true },
      });

      if (!workspaceUser) {
        console.warn(
          `[ChequeService] workspaceUser not found for cheque ${entity.id}`
        );
        return;
      }

      const context: AuthContext = {
        workspaceId: entity.workspaceId,
        user: workspaceUser.user,
        workspaceUser: workspaceUser as any,
      };

      await this.reminderService.create(reminderData, context);
      console.log(
        `✅ [ChequeService] Auto-reminder created for cheque ${entity.id}`
      );
    } catch (error) {
      console.error(
        `❌ [ChequeService] Failed to create auto-reminder for cheque ${entity.id}:`,
        error
      );
      // خطا را لاگ می‌کنیم ولی اجازه می‌دهیم چک ثبت شود
    }
  }

  /**
   * ساخت توضیحات یادآور از اطلاعات چک
   */
  private buildReminderDescription(cheque: any): string {
    const parts: string[] = [];
    parts.push(`مبلغ: ${cheque.amount.toLocaleString()} تومان`);
    if (cheque.bankName) parts.push(`بانک: ${cheque.bankName}`);
    if (cheque.branchName) parts.push(`شعبه: ${cheque.branchName}`);
    if (cheque.accountNumber) parts.push(`شماره حساب: ${cheque.accountNumber}`);
    if (cheque.description) parts.push(`توضیحات: ${cheque.description}`);
    return parts.join("\n");
  }

  /**
   * Handle before status change - بررسی قوانین گذار وضعیت
   */
  private async handleBeforeStatusChange(event: any): Promise<void> {
    const { id, status } = event;
    const cheque = await this.getById(id);

    // قوانین گذار وضعیت (می‌توانی بر اساس نیاز تغییر دهی)
    const validTransitions: Record<ChequeStatus, ChequeStatus[]> = {
      CREATED: ["HANDED_OVER", "CANCELLED", "LOST"],
      HANDED_OVER: ["DEPOSITED", "RETURNED", "CANCELLED"],
      DEPOSITED: ["CLEARED", "RETURNED"],
      CLEARED: [], // وضعیت نهایی
      RETURNED: ["DEPOSITED", "CANCELLED"], // می‌تواند دوباره خوابانده شود
      CANCELLED: [], // وضعیت نهایی
      LOST: ["CANCELLED"], // فقط می‌تواند باطل شود
    };

    const currentStatus = cheque.status as ChequeStatus;
    const allowedStatuses = validTransitions[currentStatus] || [];

    if (!allowedStatuses.includes(status as ChequeStatus)) {
      throw new Error(
        `انتقال از وضعیت ${currentStatus} به ${status} مجاز نیست.`
      );
    }
  }

  /**
   * Handle after status change - همگام‌سازی با Reminderها و Payment
   */
  private async handleAfterStatusChange(entity: any, data?: any): Promise<void> {
    const status = entity.status as ChequeStatus;

    // اگر چک پاس شد (CLEARED)، Reminderهای فعال را غیرفعال کن
    if (status === "CLEARED" || status === "RETURNED" || status === "CANCELLED") {
      try {
        await prisma.reminder.updateMany({
          where: {
            chequeId: entity.id,
            status: "PENDING",
            isActive: true,
          },
          data: {
            isActive: false,
            status: "DONE",
          },
        });
        console.log(
          `✅ [ChequeService] Deactivated reminders for cheque ${entity.id}`
        );
      } catch (error) {
        console.error(
          `❌ [ChequeService] Failed to deactivate reminders:`,
          error
        );
      }
    }

    // اگر چک پاس شد و هنوز Payment مرتبط ندارد، یک Payment ایجاد کن
    if (status === "CLEARED" && !entity.paymentId) {
      try {
        const payment = await prisma.payment.create({
          data: {
            workspaceId: entity.workspaceId,
            workspaceUserId: entity.workspaceUserId,
            invoiceId: entity.invoiceId,
            amount: entity.amount,
            type: entity.direction === "INCOMING" ? "RECEIVE" : "PAY",
            method: "TRANSFER", // یا می‌توانی یک متد جدید CHEQUE اضافه کنی
            status: "SUCCESS",
            paidAt: new Date(),
            description: `پرداخت از طریق چک شماره ${entity.chequeNumber}`,
          },
        });

        // اتصال Payment به Cheque
        await prisma.cheque.update({
          where: { id: entity.id },
          data: { paymentId: payment.id },
        });

        console.log(
          `✅ [ChequeService] Created payment ${payment.id} for cheque ${entity.id}`
        );
      } catch (error) {
        console.error(
          `❌ [ChequeService] Failed to create payment for cheque:`,
          error
        );
      }
    }
  }

  /**
   * متد عمومی برای تغییر وضعیت چک
   */
  public async updateChequeStatus(
    id: number,
    status: ChequeStatus,
    context: AuthContext
  ): Promise<any> {
    // فراخوانی beforeStatusChange
    await this.handleBeforeStatusChange({ id, status });

    // آپدیت وضعیت
    const updatedCheque = await prisma.cheque.update({
      where: { id },
      data: { status },
      include: {
        workspaceUser: true,
        invoice: true,
        payment: true,
        bankAccount: true,
      },
    });

    // فراخوانی afterStatusChange
    await this.handleAfterStatusChange(updatedCheque, { status });

    return updatedCheque;
  }
}


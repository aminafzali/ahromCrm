import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { connects, relations, searchFileds } from "../data/fetch";
import { createPaymentSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Payment");
  }
}

export class PaymentServiceApi extends BaseService<any> {
  protected notifRepo: NotificationServiceApi;

  constructor() {
    super(
      new Repository(),
      createPaymentSchema,
      createPaymentSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
    this.notifRepo = new NotificationServiceApi();

    // Initialize hooks
    this.afterCreate = this.handleAfterCreate;
  }

  /**
   * Handle after create hook
   */
  private async handleAfterCreate(entity: any): Promise<void> {
    let baseLink: string = process.env.NEXTAUTH_URL
      ? process.env.NEXTAUTH_URL
      : "http://localhost:3011";
    baseLink += "/panel/payments/" + entity.id;
    const message =
      `پرداخت شما با موفقیت انجام شد` +
      "\n" +
      "شماره پیگیری :‌ " +
      entity.reference;

    // Create notification
     //todo:t3 نیاز به اصلاحیه جدی
    // await this.notifRepo.create({
    //   userId: entity.userId,
    //   title: "پرداخت موفق",
    //   message,
    // });
  }
}
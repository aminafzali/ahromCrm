import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { SmsHelper } from "@/lib/smsHelper";
import { UserServiceApi } from "@/modules/users/service/UserServiceApi";
import { relations, searchFileds } from "../data/fetch";
import { createNotificationSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Notification");
  }
}

export class NotificationServiceApi extends BaseService<any> {
  protected userRepo: UserServiceApi;

  constructor() {
    super(
      new Repository(),
      createNotificationSchema,
      createNotificationSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.userRepo = new UserServiceApi();

    // Initialize hooks
    this.afterCreate = this.handleAfterCreate;
  }

  /**
   * Handle after create hook to send SMS
   */
  private async handleAfterCreate(entity: any): Promise<void> {
    try {
      console.log("entity n", entity);
      // Get user phone number
      const user = await this.userRepo.getById(entity.userId);

      if (user && entity.sendSms) {
        console.log("smsSend", entity.sendSms);
        // Send SMS notification
        await SmsHelper.sendNotification(
          user.phone,
          entity.title,
          entity.message
        );
      }
    } catch (error) {
      console.error("Error sending notification SMS:", error);
    }
  }
}

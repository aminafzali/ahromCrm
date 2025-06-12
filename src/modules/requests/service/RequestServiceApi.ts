import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { relations, searchFileds } from "../data/fetch";
import { createRequestSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Request");
  }
}

export class RequestServiceApi extends BaseService<any> {
  protected notifRepo: NotificationServiceApi;
  
  constructor() {
    super(
      new Repository(),
      createRequestSchema,
      createRequestSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.notifRepo = new NotificationServiceApi();

    this.afterCreate = this.handleAfterCreate;
    this.afterStatusChange = this.handleAfterChangeStatus;
  }

  async update(id: number, data: any) {
    const updateData: any = { ...data };

    // Handle form submission
    if (data.formSubmissionid) {
      updateData.formSubmissionid = data.formSubmissionid;
    }

    const entity = await this.repository.update(id, updateData);
    return entity;
  }

  private async handleAfterCreate(entity: any , data: any): Promise<void> {
    let baseLink = process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL : "http://localhost:3011";
    baseLink += "/panel/request/" + entity.id;
    const message = `درخواست شما با موفقیت ثبت شد` + "\n" + "شماره پیگیری :‌ " + entity.id;

    await this.notifRepo.create({
      userId: entity.userId,
      requestId: entity.id,
      title: 'ثبت درخواست',
      message,
    });
  }

  private async handleAfterChangeStatus(entity: any , data: any): Promise<void> {
    let baseLink = process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL : "http://localhost:3011";
    baseLink += "/panel/request/" + entity.id;
    let message = `درخواست شما به روز رسانی شد` + " از وضعیت " + data.oldStatus + " به " + data.newStatus;
    if (entity.note) message += "\n\n" + entity.note;
    message += "\n" + "شماره پیگیری :‌ " + entity.id;

    console.log("entity r" , entity )
    console.log("data r" , data )
    await this.notifRepo.create({
      userId: entity.userId,
      requestId: entity.id,
      title: 'تغییر وضعیت',
      message,
      sendSms : data.sendSms,
    });
  }
}
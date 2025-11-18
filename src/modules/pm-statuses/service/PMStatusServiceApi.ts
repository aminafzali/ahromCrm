// مسیر فایل: src/modules/pm-statuses/service/PMStatusServiceApi.ts

import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { FullQueryParams } from "@/@Server/types";
import { connects, relations, searchFileds } from "../data/fetch";
import {
  createPMStatusSchema,
  updatePMStatusSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("pMStatus");
  }
}

export class PMStatusServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createPMStatusSchema,
      updatePMStatusSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
  }

  /**
   * getAll: پشتیبانی از فیلتر projectId
   * - اگر projectId null باشد: فقط وضعیت‌های کلی را برمی‌گرداند
   * - اگر projectId مشخص باشد: فقط وضعیت‌های خاص آن پروژه را برمی‌گرداند
   * - اگر projectId ارسال نشده باشد: همه وضعیت‌ها (کلی و خاص) را برمی‌گرداند
   */
  async getAll(params: FullQueryParams, context: AuthContext) {
    // اگر فیلتر projectId ارسال شده باشد، آن را حفظ می‌کنیم
    // BaseService خودش این فیلتر را اعمال خواهد کرد
    return super.getAll(params, context);
  }

  /**
   * create: مدیریت projectId
   * - اگر project ارسال شده باشد، projectId را از آن استخراج می‌کنیم
   * - اگر project ارسال نشده باشد، projectId = null (وضعیت کلی)
   */
  async create(data: any, context: AuthContext): Promise<any> {
    const validatedData = this.validate(this.createSchema, data);

    // استخراج project از validatedData
    const { project, projectId, ...statusData } = validatedData;

    const finalData: any = {
      ...statusData,
      workspaceId: context.workspaceId,
      // اگر project ارسال شده باشد، از آن استفاده می‌کنیم، در غیر این صورت از projectId (که ممکن است null باشد)
      projectId: project?.id ?? projectId ?? null,
    };

    return await this.repository.create(finalData);
  }

  /**
   * update: مدیریت projectId
   */
  async update(id: number, data: any): Promise<any> {
    const validatedData = this.validate(this.updateSchema, data);

    const { project, projectId, ...statusData } = validatedData;

    const finalData: any = {
      ...statusData,
      // اگر project ارسال شده باشد، از آن استفاده می‌کنیم
      // اگر projectId ارسال شده باشد (حتی null)، از آن استفاده می‌کنیم
      // در غیر این صورت فیلد را تغییر نمی‌دهیم
      ...(project !== undefined
        ? { projectId: project?.id ?? null }
        : projectId !== undefined
        ? { projectId }
        : {}),
    };

    return await this.repository.update(id, finalData);
  }
}

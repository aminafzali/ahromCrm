// مسیر فایل: src/@Client/Http/Repository/BaseRepository.ts (نسخه نهایی و کامل)

import { FullQueryParams, PaginationResult } from "@/@Client/types";
import { BaseApi } from "../Controller/BaseApi";

export class BaseRepository<T, IdType extends string | number> extends BaseApi {
  constructor(slug: string) {
    super(`/api/${slug}`);
  }

  getAll(params: FullQueryParams): Promise<PaginationResult<T>> {
    return this.get<PaginationResult<T>>("", params);
  }

  getById(id: IdType, params?: any): Promise<T> {
    return this.get<T>(`/${id}`, params);
  }

  create<CreateInput>(data: CreateInput): Promise<T> {
    return this.post<T>("", data);
  }

  update<UpdateInput>(id: IdType, data: UpdateInput): Promise<T> {
    return this.patch<T>(`/${id}`, data);
  }

  Put<UpdateInput>(id: IdType, data: UpdateInput): Promise<T> {
    return this.put<T>(`/${id}`, data);
  }

  delete(id: IdType): Promise<void> {
    return this.Delete<void>(`/${id}`);
  }

  updateStatus<UpdateStatus>(id: IdType, data: UpdateStatus): Promise<T> {
    return this.patch<T>(`/${id}/status`, data);
  }

  createReminder<ReminderInput>(
    id: IdType,
    data: ReminderInput
  ): Promise<void> {
    return this.post<void>(`/${id}/reminders`, data);
  }

  link(id: IdType, data: any): Promise<T> {
    return this.patch<T>(`/${id}/link`, data);
  }

  unlink(id: IdType, data: any): Promise<T> {
    return this.patch<T>(`/${id}/unlink`, data);
  }
}

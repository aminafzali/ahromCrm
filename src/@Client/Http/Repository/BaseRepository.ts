// مسیر فایل: src/@Client/Http/Repository/BaseRepository.ts

import { FullQueryParams, PaginationResult } from "@/@Client/types";
import { BaseApi } from "../Controller/BaseApi";

export class BaseRepository<
  T,
  IdType extends string | number,
  CreateInput = any,
  UpdateInput = any
> extends BaseApi {
  // ===== شروع اصلاحیه کلیدی =====
  protected slug: string; // slug را به عنوان یک پراپرتی داخلی نگه می‌داریم

  constructor(slug: string) {
    super("/api"); // همیشه آدرس پایه صحیح را به والد پاس می‌دهیم
    this.slug = slug;
  }

  // در تمام متدها، از this.slug برای ساختن اندپوینت صحیح استفاده می‌کنیم
  getAll(params: FullQueryParams): Promise<PaginationResult<T>> {
    return this.get<PaginationResult<T>>(this.slug, params);
  }

  getById(id: IdType, params?: any): Promise<T> {
    return this.get<T>(`${this.slug}/${id}`, params);
  }

  create(data: CreateInput): Promise<T> {
    return this.post<T>(this.slug, data);
  }

  update<U extends UpdateInput>(id: IdType, data: U): Promise<T> {
    return this.patch<T>(`${this.slug}/${id}`, data);
  }

  Put(id: IdType, data: any): Promise<T> {
    return this.put<T>(`${this.slug}/${id}`, data);
  }

  delete(id: IdType): Promise<void> {
    return this.Delete<void>(`${this.slug}/${id}`);
  }

  updateStatus<S>(id: IdType, data: S): Promise<T> {
    return this.patch<T>(`${this.slug}/${id}/update-status`, data);
  }

  createReminder<R>(id: IdType, data: R): Promise<void> {
    return this.post<void>(`${this.slug}/${id}/reminders`, data);
  }

  link(id: IdType, data: any): Promise<T> {
    return this.patch<T>(`${this.slug}/${id}/link`, data);
  }

  unlink(id: IdType, data: any): Promise<T> {
    return this.patch<T>(`${this.slug}/${id}/unlink`, data);
  }
  // ===== پایان اصلاحیه کلیدی =====
}

// مسیر فایل: src/@Client/Http/Repository/BaseRepository.ts

import { FullQueryParams, PaginationResult } from "@/@Client/types";
import { BaseApi } from "../Controller/BaseApi";

export class BaseRepository<
  T,
  IdType extends string | number,
  CreateInput = any,
  UpdateInput = any
> extends BaseApi {
  constructor(slug: string) {
    super(slug);
  }

  getAll(params: FullQueryParams): Promise<PaginationResult<T>> {
    return this.get<PaginationResult<T>>("", params);
  }

  getById(id: IdType, params?: any): Promise<T> {
    return this.get<T>(`/${id}`, params);
  }

  create(data: CreateInput): Promise<T> {
    return this.post<T>("", data);
  }

  update<U extends UpdateInput>(id: IdType, data: U): Promise<T> {
    return this.patch<T>(`/${id}`, data);
  }

  Put(id: IdType, data: any): Promise<T> {
    return this.put<T>(`/${id}`, data);
  }

  delete(id: IdType): Promise<void> {
    return this.Delete<void>(`/${id}`);
  }

  updateStatus<S>(id: IdType, data: S): Promise<T> {
    return this.patch<T>(`/${id}/status`, data);
  }

  createReminder<R>(id: IdType, data: R): Promise<void> {
    return this.post<void>(`/${id}/reminders`, data);
  }

  link(id: IdType, data: any): Promise<T> {
    return this.patch<T>(`/${id}/link`, data);
  }

  unlink(id: IdType, data: any): Promise<T> {
    return this.patch<T>(`/${id}/unlink`, data);
  }
}

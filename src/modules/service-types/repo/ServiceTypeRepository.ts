import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ServiceType } from "../types";

export class ServiceTypeRepository extends BaseRepository<ServiceType, number> {
  constructor() {
    super("service-types");
  }
}
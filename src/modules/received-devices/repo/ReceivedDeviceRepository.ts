// src/modules/received-devices/repo/ReceivedDeviceRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ReceivedDeviceWithRelations } from "../types";

export class ReceivedDeviceRepository extends BaseRepository<
  ReceivedDeviceWithRelations,
  number
> {
  constructor() {
    super("received-devices");
  }
}

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { connects, relations, searchFileds } from "../data/fetch";
import { createLabelSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Label");
  }
}

export class LabelServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createLabelSchema,
      createLabelSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
  }
}

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { connects, relations, searchFileds } from "../data/fetch";
import { createUserSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("User");
  }
}

export class UserServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createUserSchema,
      createUserSchema,
      searchFileds,
      relations,
      { role: "USER" }
    );
    this.connect = connects;
    this.repository = new Repository();
  }
}

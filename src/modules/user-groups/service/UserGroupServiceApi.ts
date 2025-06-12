import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { connect, relations, searchFileds } from "../data/fetch";
import { createUserGroupSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("UserGroup");
  }
}

export class UserGroupServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createUserGroupSchema, createUserGroupSchema, searchFileds, relations);
    this.repository = new Repository();
    this.connect = connect;
  }
}
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { z } from "zod";

const createSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.coerce.number().int().positive(),
  body: z.string().min(1),
  parent: z.object({ id: z.coerce.number() }).optional().nullable(),
});
const updateSchema = z.object({ body: z.string().min(1).optional() });

class Repository extends BaseRepository<any> {
  constructor() {
    super("Comment");
  }
}

export class CommentServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createSchema, updateSchema, ["body"], []);
    this.repository = new Repository();
  }
}

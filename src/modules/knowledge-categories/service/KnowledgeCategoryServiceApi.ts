import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { z } from "zod";
import { connects, relations, searchFileds } from "../data/fetch";

const related = z.object({ id: z.coerce.number().int().positive() }).passthrough();
const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  parent: related.optional().nullable(),
});
const updateSchema = createSchema.partial();

class Repository extends BaseRepository<any> {
  constructor() {
    super("KnowledgeCategory");
  }
}

export class KnowledgeCategoryServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createSchema, updateSchema, searchFileds, relations);
    this.repository = new Repository();
    this.connect = connects;
  }
}



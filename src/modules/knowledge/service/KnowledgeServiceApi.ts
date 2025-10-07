import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createKnowledgeSchema,
  updateKnowledgeSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Knowledge");
  }
}

export class KnowledgeServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createKnowledgeSchema,
      updateKnowledgeSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }
  async create(data: any, context: any) {
    const validated = this.validate(this.createSchema, data);
    const { labels, assignees, assigneesTeams, category, ...rest } =
      validated as any;
    const finalData: any = {
      ...rest,
      workspaceId: Number(context.workspaceId),
      ...(category?.id ? { categoryId: Number(category.id) } : {}),
      labels: labels
        ? { connect: labels.map((l: any) => ({ id: Number(l.id) })) }
        : undefined,
      assignees: assignees
        ? { connect: assignees.map((u: any) => ({ id: Number(u.id) })) }
        : undefined,
      assigneesTeams: assigneesTeams
        ? { connect: assigneesTeams.map((t: any) => ({ id: Number(t.id) })) }
        : undefined,
    };
    return (prisma as any).knowledge.create({ data: finalData, include });
  }
  async update(id: number, data: any) {
    const validated = this.validate(this.updateSchema, data);
    const { labels, assignees, assigneesTeams, category, ...rest } =
      validated as any;
    const finalData: any = {
      ...rest,
      ...(category?.id ? { categoryId: Number(category.id) } : {}),
      labels: labels
        ? { set: labels.map((l: any) => ({ id: Number(l.id) })) }
        : undefined,
      assignees: assignees
        ? { set: assignees.map((u: any) => ({ id: Number(u.id) })) }
        : undefined,
      assigneesTeams: assigneesTeams
        ? { set: assigneesTeams.map((t: any) => ({ id: Number(t.id) })) }
        : undefined,
    };
    return (prisma as any).knowledge.update({
      where: { id },
      data: finalData,
      include,
    });
  }
}

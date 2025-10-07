import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createSupportsSchema,
  updateSupportsSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("SupportTicket");
  }
}

export class SupportsServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createSupportsSchema,
      updateSupportsSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }

  async create(data: any, context: AuthContext): Promise<any> {
    const validated = this.validate(this.createSchema, data);
    const { user, assignedAdmin, assignedTeam, category, labels, ...rest } =
      validated as any;
    return prisma.supportTicket.create({
      data: {
        ...rest,
        workspaceId: context.workspaceId,
        userId: user?.id,
        assignedAdminId: assignedAdmin?.id,
        assignedTeamId: assignedTeam?.id,
        categoryId: category?.id,
        ...(labels && labels.length
          ? { labels: { connect: labels.map((l: any) => ({ id: l.id })) } }
          : {}),
      },
      include,
    });
  }

  async update(id: number, data: any): Promise<any> {
    const validated = this.validate(this.updateSchema, data);
    const { user, assignedAdmin, assignedTeam, category, labels, ...rest } =
      validated as any;
    return prisma.supportTicket.update({
      where: { id },
      data: {
        ...rest,
        ...(user ? { userId: user.id } : {}),
        ...(assignedAdmin ? { assignedAdminId: assignedAdmin.id } : {}),
        ...(assignedTeam ? { assignedTeamId: assignedTeam.id } : {}),
        ...(category ? { categoryId: category.id } : {}),
        ...(labels
          ? { labels: { set: labels.map((l: any) => ({ id: l.id })) } }
          : {}),
      },
      include,
    });
  }
}

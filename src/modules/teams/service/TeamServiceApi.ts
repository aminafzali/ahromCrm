import { Prisma } from "@prisma/client";
import { TeamRepository } from "../repo/TeamRepository";
import { ITeamCreate, ITeamUpdate } from "../types";

export class TeamServiceApi {
  private teamRepository: TeamRepository;

  constructor() {
    this.teamRepository = new TeamRepository();
  }

  async getTeams(workspaceId: number, query: any = {}) {
    const { page = 1, limit = 10, search = "" } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TeamWhereInput = {
      workspaceId,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    };

    const args: Prisma.TeamFindManyArgs = {
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { members: true, assignedProjects: true },
        },
      },
    };

    const { data, total } = await this.teamRepository.findAll(args);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTeamById(id: number, workspaceId: number) {
    const team = await this.teamRepository.findById(id);
    if (!team || team.workspaceId !== workspaceId) {
      throw new Error("Team not found");
    }
    return team;
  }

  async createTeam(workspaceId: number, data: ITeamCreate) {
    return this.teamRepository.create({ ...data, workspaceId });
  }

  async updateTeam(id: number, data: ITeamUpdate) {
    return this.teamRepository.update(id, data);
  }

  async deleteTeam(id: number) {
    return this.teamRepository.delete(id);
  }
}

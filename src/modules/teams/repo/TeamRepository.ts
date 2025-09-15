import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ITeamCreate, ITeamUpdate } from "../types";

export class TeamRepository {
  private model = prisma.team;

  async findAll(args: Prisma.TeamFindManyArgs) {
    const [data, total] = await prisma.$transaction([
      this.model.findMany(args),
      this.model.count({ where: args.where }),
    ]);
    return { data, total };
  }

  async findById(id: number) {
    return this.model.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            workspaceUser: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: number) {
    // Transaction to delete team and its members
    return prisma.$transaction([
      prisma.teamMember.deleteMany({ where: { teamId: id } }),
      this.model.delete({ where: { id } }),
    ]);
  }

  async create(data: ITeamCreate & { workspaceId: number }) {
    const { members, ...teamData } = data;
    return prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: teamData,
      });

      if (members && members.length > 0) {
        await tx.teamMember.createMany({
          data: members.map((workspaceUserId) => ({
            teamId: team.id,
            workspaceUserId,
          })),
        });
      }
      return team;
    });
  }

  async update(id: number, data: ITeamUpdate) {
    const { members, ...teamData } = data;
    return prisma.$transaction(async (tx) => {
      const team = await tx.team.update({
        where: { id },
        data: teamData,
      });

      // Sync members
      await tx.teamMember.deleteMany({ where: { teamId: id } });
      if (members && members.length > 0) {
        await tx.teamMember.createMany({
          data: members.map((workspaceUserId) => ({
            teamId: team.id,
            workspaceUserId,
          })),
        });
      }
      return team;
    });
  }
}

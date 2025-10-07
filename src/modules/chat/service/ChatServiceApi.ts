import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Rooms CRUD uses BaseService; messages handled with custom methods

const roomCreate = z.object({
  name: z.string().min(1),
  isDirect: z.boolean().optional(),
});
const roomUpdate = roomCreate.partial();

class RoomRepository extends BaseRepository<any> {
  constructor() {
    super("ChatRoom");
  }
}

export class ChatServiceApi extends BaseService<any> {
  constructor() {
    super(new RoomRepository(), roomCreate, roomUpdate, ["name"], []);
    this.repository = new RoomRepository();
  }

  async listMessages(roomId: number, params: { page?: number; limit?: number }) {
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params?.limit || 20)));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      (prisma as any).chatMessage.findMany({
        where: { roomId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      (prisma as any).chatMessage.count({ where: { roomId } }),
    ]);
    return { data: items, meta: { page, limit, total } };
  }

  async createMessage(roomId: number, data: { body: string }) {
    const schema = z.object({ body: z.string().min(1) });
    const validated = schema.parse(data);
    return (prisma as any).chatMessage.create({
      data: { roomId, body: validated.body },
    });
  }
}



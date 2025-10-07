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

  async create(data: any, context: any) {
    console.log("🚀 ChatServiceApi: Starting create with data:", data);
    console.log("🚀 ChatServiceApi: Context:", context);

    const validated = this.validate(this.createSchema, data);
    console.log("✅ ChatServiceApi: Validation passed:", validated);

    const name: string = validated.name;
    // infer room type from name pattern; fallback to GROUP
    let type: any = "GROUP";
    try {
      if (/^Team#/.test(name)) type = "TEAM";
      else if (/^Support#\d+#\d+/.test(name)) type = "DIRECT";
      else if (/^(Customer|User)#/.test(name)) type = "CUSTOMER";
      else if (/^Project#/.test(name)) type = "GROUP"; // Projects are groups
    } catch {}

    console.log("🔍 ChatServiceApi: Inferred type:", type, "for name:", name);

    const finalData = {
      title: name, // Use 'title' instead of 'name' to match Prisma schema
      workspaceId: Number(context.workspaceId),
      type,
      createdById: context.workspaceUser?.id || context.userId,
    };

    console.log("🚀 ChatServiceApi: Creating chat room with data:", finalData);

    const result = await (prisma as any).chatRoom.create({
      data: finalData,
    });

    console.log("✅ ChatServiceApi: Chat room created successfully:", result);
    return result;
  }

  async listMessages(
    roomId: number,
    params: { page?: number; limit?: number }
  ) {
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params?.limit || 20)));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      (prisma as any).chatMessage.findMany({
        where: { roomId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      (prisma as any).chatMessage.count({ where: { roomId } }),
    ]);
    return { data: items, meta: { page, limit, total } };
  }

  async createMessage(roomId: number, data: { body: string }, context?: any) {
    const schema = z.object({ body: z.string().min(1) });
    const validated = schema.parse(data);

    // Get senderId from context or use a default (this should be provided by the API route)
    const senderId = context?.workspaceUser?.id || context?.userId || 1;

    return (prisma as any).chatMessage.create({
      data: {
        roomId,
        body: validated.body,
        senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}

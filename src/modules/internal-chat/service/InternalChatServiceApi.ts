import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { ChatRoomMemberRole, InternalChatRoomType } from "@prisma/client";
import {
  connects,
  include,
  includeMessage,
  relations,
  searchFields,
} from "../data/fetch";

class Repository extends BaseRepository<any> {
  constructor() {
    super("ChatRoom");
  }
}

export class InternalChatServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      null as any, // No create schema for now
      null as any, // No update schema for now
      searchFields,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
  }

  /**
   * Get or create direct room between current user and another workspace user
   * Only Admin users in the same workspace can use internal chat
   */
  async getOrCreateDirectRoom(
    data: { workspaceUserId: number },
    context: AuthContext
  ) {
    console.log("🔄 [Internal Chat Service] getOrCreateDirectRoom:", {
      targetWorkspaceUserId: data.workspaceUserId,
      currentWorkspaceUserId: context.workspaceUser?.id,
      workspaceId: context.workspaceId,
    });

    const { workspaceUserId } = data;
    const currentUserId = context.workspaceUser?.id;

    if (!currentUserId) {
      console.error("❌ [Internal Chat Service] User not authenticated");
      throw new Error("User not authenticated");
    }

    const isSelfChat = currentUserId === workspaceUserId;
    console.log("🔍 [Internal Chat Service] isSelfChat:", isSelfChat);

    // Verify both users are admins in the same workspace
    const [currentUser, targetUser] = await Promise.all([
      prisma.workspaceUser.findUnique({
        where: { id: currentUserId },
        include: { role: true },
      }),
      prisma.workspaceUser.findUnique({
        where: { id: workspaceUserId },
        include: { role: true },
      }),
    ]);

    if (!currentUser || !targetUser) {
      throw new Error("User not found");
    }

    // Check if both users are in the same workspace
    if (
      currentUser.workspaceId !== context.workspaceId ||
      targetUser.workspaceId !== context.workspaceId
    ) {
      throw new Error("Users must be in the same workspace");
    }

    // Check if both users are admins
    if (
      currentUser.role?.name !== "Admin" ||
      targetUser.role?.name !== "Admin"
    ) {
      throw new Error("Only admin users can use internal chat");
    }

    // For self-chat (Saved Messages), find room with only one member
    if (isSelfChat) {
      const existingSelfRoom = await prisma.chatRoom.findFirst({
        where: {
          workspaceId: context.workspaceId,
          type: InternalChatRoomType.DIRECT,
          title: `SELF_${currentUserId}`, // Unique identifier for self-chat
          members: {
            every: { workspaceUserId: currentUserId },
          },
        },
        include,
      });

      if (existingSelfRoom) {
        console.log(
          "✅ [Internal Chat Service] Found existing self-chat room:",
          existingSelfRoom.id
        );
        return existingSelfRoom;
      }

      // Create new self-chat room (Saved Messages)
      console.log(
        "➕ [Internal Chat Service] Creating new self-chat room (Saved Messages)..."
      );
      const newSelfRoom = await prisma.chatRoom.create({
        data: {
          workspaceId: context.workspaceId,
          type: InternalChatRoomType.DIRECT,
          title: `SELF_${currentUserId}`,
          createdById: currentUserId,
          members: {
            create: [
              {
                workspaceUserId: currentUserId,
                role: ChatRoomMemberRole.OWNER,
              },
            ],
          },
        },
        include,
      });

      return newSelfRoom;
    }

    // For regular direct chat, find room with exactly these two members
    // استفاده از transaction برای جلوگیری از race condition
    const existingRoom = await prisma.$transaction(async (tx) => {
      // پیدا کردن همه room هایی که هر دو کاربر عضو آن هستند
      const rooms = await tx.chatRoom.findMany({
        where: {
          workspaceId: context.workspaceId!,
          type: InternalChatRoomType.DIRECT,
          OR: [{ title: null }, { title: { not: { startsWith: "SELF_" } } }],
          AND: [
            {
              members: {
                some: {
                  workspaceUserId: currentUserId,
                  leftAt: null,
                },
              },
            },
            {
              members: {
                some: {
                  workspaceUserId: workspaceUserId,
                  leftAt: null,
                },
              },
            },
          ],
        },
        include: {
          members: {
            where: {
              leftAt: null,
            },
          },
        },
      });

      console.log(
        `🔍 [Internal Chat Service] Found ${rooms.length} potential rooms for users ${currentUserId} & ${workspaceUserId}`
      );

      // پیدا کردن room ای که دقیقاً شامل این دو کاربر است (و فقط این دو)
      for (const room of rooms) {
        const memberIds = room.members.map((m) => m.workspaceUserId).sort();
        const expectedIds = [currentUserId, workspaceUserId].sort();

        if (
          memberIds.length === 2 &&
          memberIds[0] === expectedIds[0] &&
          memberIds[1] === expectedIds[1]
        ) {
          console.log(
            `✅ [Internal Chat Service] Found existing direct room: ${room.id}`
          );
          // بارگذاری کامل room با تمام relations
          const fullRoom = await tx.chatRoom.findUnique({
            where: { id: room.id },
            include,
          });
          return fullRoom;
        }
      }

      // اگر room وجود نداشت، ایجاد کنیم
      console.log(
        `➕ [Internal Chat Service] Creating new direct room between users ${currentUserId} & ${workspaceUserId}...`
      );
      const newRoom = await tx.chatRoom.create({
        data: {
          workspaceId: context.workspaceId!,
          type: InternalChatRoomType.DIRECT,
          createdById: currentUserId,
          members: {
            create: [
              {
                workspaceUserId: currentUserId,
                role: ChatRoomMemberRole.ADMIN,
              },
              {
                workspaceUserId: workspaceUserId,
                role: ChatRoomMemberRole.MEMBER,
              },
            ],
          },
        },
        include,
      });

      console.log(
        `✅ [Internal Chat Service] Created new room ${newRoom.id} for users ${currentUserId} & ${workspaceUserId}`
      );
      return newRoom;
    });

    return existingRoom;
  }

  /**
   * Get or create team room for a team
   * Only Admin members of the team can access
   */
  async getOrCreateTeamRoom(data: { teamId: number }, context: AuthContext) {
    const { teamId } = data;

    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // Verify team exists and belongs to the workspace
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        workspaceId: context.workspaceId!,
      },
      include: {
        members: {
          include: {
            workspaceUser: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!team) {
      throw new Error("Team not found in this workspace");
    }

    // Check if current user is a member of the team and is admin
    const currentUserMembership = team.members.find(
      (m) => m.workspaceUserId === context.workspaceUser!.id
    );

    if (!currentUserMembership) {
      throw new Error("You are not a member of this team");
    }

    if (currentUserMembership.workspaceUser.role?.name !== "Admin") {
      throw new Error("Only admin users can use internal chat");
    }

    // Check if team room already exists
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        workspaceId: context.workspaceId!,
        type: InternalChatRoomType.TEAM,
        teamId,
      },
      include,
    });

    if (existingRoom) {
      return existingRoom;
    }

    // Get only admin members of the team
    const adminMembers = team.members.filter(
      (m) => m.workspaceUser.role?.name === "Admin"
    );

    // Create new team room
    const newRoom = await prisma.chatRoom.create({
      data: {
        workspaceId: context.workspaceId!,
        type: InternalChatRoomType.TEAM,
        teamId,
        createdById: context.workspaceUser!.id,
        members: {
          create: adminMembers.map((member) => ({
            workspaceUserId: member.workspaceUserId,
            role: ChatRoomMemberRole.MEMBER,
          })),
        },
      },
      include,
    });

    return newRoom;
  }

  /**
   * Get room messages with pagination
   */
  async getRoomMessages(
    roomId: number,
    params: { page?: number; limit?: number },
    context: AuthContext
  ) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // Verify user is member of the room
    const membership = await prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        workspaceUserId: context.workspaceUser.id,
        leftAt: null,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this room");
    }

    // Verify room belongs to the workspace and get members for read status
    const roomForReadStatus = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        workspaceId: context.workspaceId!,
      },
      include: {
        members: {
          where: { leftAt: null },
          select: { id: true, workspaceUserId: true },
        },
      },
    });

    if (!roomForReadStatus) {
      throw new Error("Room not found in this workspace");
    }

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: {
          roomId,
          // نمایش پیام‌های حذف‌شده نیز برای نشان دادن برچسب "حذف شده"
        },
        include: includeMessage,
        orderBy: {
          createdAt: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.chatMessage.count({
        where: {
          roomId,
        },
      }),
    ]);

    // Add isRead flag based on readReceipts
    // برای پیام‌های من: isRead = true اگر همه گیرنده‌ها خوانده باشند
    // برای پیام‌های دیگران: isRead = true اگر من خوانده باشم

    const messagesWithReadStatus = messages.map((msg: any) => {
      const isMyMessage = msg.senderId === context.workspaceUser!.id;

      if (isMyMessage) {
        // برای پیام‌های من: چک کنیم همه گیرنده‌های دیگر خوانده‌اند؟
        const otherMembers =
          roomForReadStatus?.members.filter(
            (m) => m.workspaceUserId !== msg.senderId
          ) || [];
        const otherMemberIds = otherMembers.map((m) => m.id);

        // اگر عضو دیگری نباشد (self-chat)، همیشه read است
        if (otherMemberIds.length === 0) {
          return { ...msg, isRead: true };
        }

        // چک کنیم همه اعضای دیگر خوانده‌اند؟
        const allOthersRead = otherMemberIds.every((memberId) =>
          msg.readReceipts?.some((r: any) => r.memberId === memberId)
        );

        return { ...msg, isRead: allOthersRead };
      } else {
        // برای پیام‌های دیگران: چک کنیم من خوانده‌ام؟
        const iReadIt = msg.readReceipts?.some(
          (receipt: any) => receipt.memberId === membership.id
        );
        return { ...msg, isRead: iReadIt };
      }
    });

    return {
      data: messagesWithReadStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async editMessage(
    messageId: number,
    data: { body: string },
    context: AuthContext
  ) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }
    const msg = await prisma.chatMessage.findFirst({
      where: { id: messageId, senderId: context.workspaceUser.id },
    });
    if (!msg) throw new Error("Message not found or not owned by user");
    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { body: data.body, isEdited: true },
      include: includeMessage,
    });
    return updated;
  }

  async deleteMessage(messageId: number, context: AuthContext) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }
    const msg = await prisma.chatMessage.findFirst({
      where: { id: messageId, senderId: context.workspaceUser.id },
    });
    if (!msg) throw new Error("Message not found or not owned by user");
    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true },
      include: includeMessage,
    });
    return updated;
  }

  /**
   * Send message to a room
   */
  async sendMessage(
    roomId: number,
    data: { body: string; replyToId?: number },
    context: AuthContext
  ) {
    console.log("📤 [Internal Chat Service] sendMessage:", {
      roomId,
      messageLength: data.body.length,
      workspaceUserId: context.workspaceUser?.id,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceUser?.id) {
      console.error("❌ [Internal Chat Service] User not authenticated");
      throw new Error("User not authenticated");
    }

    // Verify user is member of the room
    const membership = await prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        workspaceUserId: context.workspaceUser.id,
        leftAt: null,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this room");
    }

    // Verify room belongs to the workspace
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        workspaceId: context.workspaceId!,
      },
    });

    if (!room) {
      throw new Error("Room not found in this workspace");
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: context.workspaceUser.id,
        body: data.body,
        replyToId: data.replyToId,
        messageType: "TEXT",
      },
      include: includeMessage,
    });

    // Update room's lastActivityAt
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { lastActivityAt: new Date() },
    });

    // Get room members to determine isRead status
    const roomWithMembers = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        members: {
          where: { leftAt: null },
          select: { id: true, workspaceUserId: true },
        },
      },
    });

    // برای پیام تازه ارسال شده:
    // - اگر self-chat است → isRead: true
    // - اگر گیرنده دیگری هست → isRead: false (هنوز نخوانده)
    const otherMembers =
      roomWithMembers?.members.filter(
        (m) => m.workspaceUserId !== context.workspaceUser!.id
      ) || [];
    const isRead = otherMembers.length === 0; // فقط در self-chat همیشه read است

    console.log("✅ [Internal Chat Service] Message created:", {
      messageId: message.id,
      senderId: message.senderId,
      roomId,
      hasOtherMembers: otherMembers.length > 0,
      isRead,
    });

    return {
      ...message,
      isRead,
    };
  }

  /**
   * Get room members
   */
  async getRoomMembers(roomId: number, context: AuthContext) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // Verify user is member of the room
    const membership = await prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        workspaceUserId: context.workspaceUser.id,
        leftAt: null,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this room");
    }

    // Verify room belongs to the workspace
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        workspaceId: context.workspaceId!,
      },
    });

    if (!room) {
      throw new Error("Room not found in this workspace");
    }

    const members = await prisma.chatRoomMember.findMany({
      where: {
        roomId,
        leftAt: null,
      },
      include: {
        workspaceUser: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return members;
  }

  /**
   * Add member to room (only for admins)
   */
  async addMemberToRoom(
    roomId: number,
    data: { workspaceUserId: number; role?: ChatRoomMemberRole },
    context: AuthContext
  ) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // Verify current user is admin of the room
    const currentMembership = await prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        workspaceUserId: context.workspaceUser.id,
        role: { in: [ChatRoomMemberRole.ADMIN, ChatRoomMemberRole.OWNER] },
        leftAt: null,
      },
    });

    if (!currentMembership) {
      throw new Error("You don't have permission to add members");
    }

    // Verify room belongs to the workspace
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        workspaceId: context.workspaceId!,
      },
    });

    if (!room) {
      throw new Error("Room not found in this workspace");
    }

    // Verify target user is in the same workspace and is admin
    const targetUser = await prisma.workspaceUser.findFirst({
      where: {
        id: data.workspaceUserId,
        workspaceId: context.workspaceId!,
      },
      include: { role: true },
    });

    if (!targetUser) {
      throw new Error("User not found in this workspace");
    }

    if (targetUser.role?.name !== "Admin") {
      throw new Error("Only admin users can be added to internal chat");
    }

    // Check if user is already a member
    const existingMember = await prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        workspaceUserId: data.workspaceUserId,
      },
    });

    if (existingMember && !existingMember.leftAt) {
      throw new Error("User is already a member of this room");
    }

    // Add or re-add member
    if (existingMember) {
      return await prisma.chatRoomMember.update({
        where: { id: existingMember.id },
        data: {
          leftAt: null,
          role: data.role || ChatRoomMemberRole.MEMBER,
        },
        include: {
          workspaceUser: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } else {
      return await prisma.chatRoomMember.create({
        data: {
          roomId,
          workspaceUserId: data.workspaceUserId,
          role: data.role || ChatRoomMemberRole.MEMBER,
          invitedById: context.workspaceUser.id,
        },
        include: {
          workspaceUser: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
              role: {
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

  /**
   * Get all admin workspace users for the current workspace
   * Used for displaying contact list
   */
  async getAdminWorkspaceUsers(context: AuthContext) {
    console.log(
      "🔄 [Internal Chat Service] getAdminWorkspaceUsers - WorkspaceId:",
      context.workspaceId
    );

    // First, let's check what roles exist
    const allUsersInWorkspace = await prisma.workspaceUser.findMany({
      where: {
        workspaceId: context.workspaceId!,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(
      "📊 [Internal Chat Service] All users in workspace:",
      allUsersInWorkspace.map((u) => ({
        id: u.id,
        displayName: u.displayName,
        roleName: u.role?.name,
      }))
    );

    // Filter admin users (case-insensitive)
    const users = allUsersInWorkspace.filter(
      (u) => u.role?.name?.toLowerCase() === "admin"
    );

    console.log("✅ [Internal Chat Service] Found admin users:", users.length);
    console.log(
      "📋 [Internal Chat Service] Admin Users:",
      users.map((u) => ({
        id: u.id,
        displayName: u.displayName,
        userName: u.user?.name,
        role: u.role?.name,
      }))
    );

    // Sort by displayName
    return users.sort((a, b) => {
      const nameA = a.displayName || "";
      const nameB = b.displayName || "";
      return nameA.localeCompare(nameB);
    });
  }

  /**
   * Get all teams where current user is an admin member
   * Used for displaying group list
   */
  async getUserTeams(context: AuthContext) {
    console.log(
      "🔄 [Internal Chat Service] getUserTeams - WorkspaceUserId:",
      context.workspaceUser?.id
    );

    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // First get all teams in workspace
    const allTeams = await prisma.team.findMany({
      where: {
        workspaceId: context.workspaceId!,
      },
      include: {
        members: {
          include: {
            workspaceUser: {
              include: {
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(
      "📊 [Internal Chat Service] All teams in workspace:",
      allTeams.map((t) => ({
        id: t.id,
        name: t.name,
        membersCount: t._count?.members,
      }))
    );

    // Filter teams where current user is a member AND has Admin role
    const teams = allTeams.filter((team) =>
      team.members.some(
        (member) =>
          member.workspaceUserId === context.workspaceUser!.id &&
          member.workspaceUser.role?.name?.toLowerCase() === "admin"
      )
    );

    console.log(
      "✅ [Internal Chat Service] Found teams (user is admin member):",
      teams.length
    );
    console.log(
      "📋 [Internal Chat Service] User's Teams:",
      teams.map((t) => ({
        id: t.id,
        name: t.name,
        membersCount: t._count?.members,
      }))
    );

    // Return teams without member details (they're not needed in the response)
    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      workspaceId: team.workspaceId,
      parentId: team.parentId,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      _count: team._count,
    })) as any;
  }

  /**
   * Get unread message count for a specific workspace user's direct room
   */
  async getUnreadCount(
    data: { workspaceUserId: number },
    context: AuthContext
  ) {
    console.log("🔄 [Internal Chat Service] getUnreadCount:", {
      targetWorkspaceUserId: data.workspaceUserId,
      currentWorkspaceUserId: context.workspaceUser?.id,
      workspaceId: context.workspaceId,
    });

    const currentUserId = context.workspaceUser?.id;
    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    // Find the direct room between these two users
    const room = await prisma.chatRoom.findFirst({
      where: {
        workspaceId: context.workspaceId!,
        type: InternalChatRoomType.DIRECT,
        AND: [
          {
            members: {
              some: { workspaceUserId: currentUserId },
            },
          },
          {
            members: {
              some: { workspaceUserId: data.workspaceUserId },
            },
          },
        ],
      },
    });

    if (!room) {
      return { count: 0 };
    }

    // Get current user's membership
    const membership = await prisma.chatRoomMember.findFirst({
      where: {
        roomId: room.id,
        workspaceUserId: currentUserId,
        leftAt: null,
      },
    });

    if (!membership) {
      return { count: 0 };
    }

    const currentMemberId = membership.id;

    // Count unread messages
    const count = await prisma.chatMessage.count({
      where: {
        roomId: room.id,
        senderId: { not: currentUserId }, // Not sent by me
        readReceipts: {
          none: {
            memberId: currentMemberId,
          },
        },
      },
    });

    console.log(
      `✅ [Internal Chat Service] Unread count for room ${room.id}:`,
      count
    );
    return { count };
  }

  /**
   * Mark all messages in a room as read
   */
  async markAsRead(data: { roomId: number }, context: AuthContext) {
    console.log("🔄 [Internal Chat Service] markAsRead:", {
      roomId: data.roomId,
      workspaceUserId: context.workspaceUser?.id,
      workspaceId: context.workspaceId,
    });

    const currentUserId = context.workspaceUser?.id;
    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    // Verify room exists and get user's membership
    const membership = await prisma.chatRoomMember.findFirst({
      where: {
        roomId: data.roomId,
        workspaceUserId: currentUserId,
        leftAt: null,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this room");
    }

    // Verify room belongs to the workspace
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: data.roomId,
        workspaceId: context.workspaceId!,
      },
    });

    if (!room) {
      throw new Error("Room not found or access denied");
    }

    // Get all messages in the room that don't have a read receipt from current user
    const unreadMessages = await prisma.chatMessage.findMany({
      where: {
        roomId: data.roomId,
        senderId: { not: currentUserId }, // Don't mark my own messages
        readReceipts: {
          none: {
            memberId: membership.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (unreadMessages.length === 0) {
      console.log("✅ [Internal Chat Service] No unread messages to mark");
      return { marked: 0 };
    }

    // Create read receipts
    const readReceipts = await prisma.chatMessageReadReceipt.createMany({
      data: unreadMessages.map((msg) => ({
        messageId: msg.id,
        memberId: membership.id,
        readAt: new Date(),
      })),
      skipDuplicates: true,
    });

    console.log(
      `✅ [Internal Chat Service] Marked ${readReceipts.count} messages as read`
    );
    return { marked: readReceipts.count };
  }
}

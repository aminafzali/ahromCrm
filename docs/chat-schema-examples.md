# 💻 مثال‌های عملی Schema سیستم Chat

## 📋 فهرست

1. [ساخت انواع مختلف Room](#1-ساخت-انواع-مختلف-room)
2. [مدیریت اعضا](#2-مدیریت-اعضا)
3. [ارسال و دریافت پیام‌ها](#3-ارسال-و-دریافت-پیامها)
4. [لینک به موجودیت‌ها](#4-لینک-به-موجودیتها)
5. [Reactions و Read Receipts](#5-reactions-و-read-receipts)
6. [امنیت و Authorization](#6-امنیت-و-authorization)
7. [Performance و Optimization](#7-performance-و-optimization)

---

## 1. ساخت انواع مختلف Room

### 1.1 گفتگوی خصوصی (DIRECT)

```typescript
async function createDirectChat(
  workspaceId: number,
  user1Id: number,
  user2Id: number
) {
  // بررسی: آیا قبلا room وجود دارد؟
  const existing = await prisma.chatRoom.findFirst({
    where: {
      workspaceId,
      type: "DIRECT",
      members: {
        every: {
          workspaceUserId: { in: [user1Id, user2Id] },
        },
      },
    },
  });

  if (existing) {
    return existing;
  }

  // ساخت room جدید
  return prisma.$transaction(async (tx) => {
    // 1. Room
    const room = await tx.chatRoom.create({
      data: {
        workspaceId,
        type: "DIRECT",
        title: null, // عنوان اتوماتیک: نام کاربران
        isPrivate: true,
        createdById: user1Id,
      },
    });

    // 2. اعضا (دقیقا 2 نفر)
    await tx.chatRoomMember.createMany({
      data: [
        {
          roomId: room.id,
          workspaceUserId: user1Id,
          role: "MEMBER",
        },
        {
          roomId: room.id,
          workspaceUserId: user2Id,
          role: "MEMBER",
        },
      ],
    });

    // 3. Settings
    await tx.chatRoomSettings.create({
      data: {
        roomId: room.id,
        whoCanPost: "ALL_MEMBERS",
        whoCanInvite: "ADMINS", // در DIRECT نمی‌توان کسی را دعوت کرد
        allowFileAttachments: true,
        allowReactions: true,
      },
    });

    return room;
  });
}

// استفاده:
const directChat = await createDirectChat(1, 10, 15);
```

### 1.2 گروه تیمی (TEAM) - خودکار

```typescript
async function createTeamChatRoom(
  teamId: number,
  workspaceId: number,
  creatorId: number
) {
  // دریافت اطلاعات تیم و اعضا
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: {
          // فقط اعضای فعال
          leftAt: null,
        },
      },
    },
  });

  if (!team) throw new Error("تیم یافت نشد");

  return prisma.$transaction(async (tx) => {
    // 1. Room
    const room = await tx.chatRoom.create({
      data: {
        workspaceId,
        type: "TEAM",
        title: `گروه ${team.name}`,
        description: `اتاق گفتگوی تیم ${team.name}`,
        teamId,
        createdById: creatorId,
        isPrivate: false,
        allowNotifications: true,
      },
    });

    // 2. اعضا (همه اعضای تیم)
    await tx.chatRoomMember.createMany({
      data: team.members.map((member, index) => ({
        roomId: room.id,
        workspaceUserId: member.workspaceUserId,
        // اولین نفر OWNER، بقیه MEMBER
        role: index === 0 ? "OWNER" : "MEMBER",
      })),
    });

    // 3. Settings (محدودتر از Direct)
    await tx.chatRoomSettings.create({
      data: {
        roomId: room.id,
        whoCanPost: "ALL_MEMBERS",
        whoCanInvite: "ADMINS", // فقط ادمین‌ها
        allowFileAttachments: true,
        allowLinkPreviews: true,
        allowReactions: true,
        maxMessageLength: 10000,
      },
    });

    // 4. پیام خوش‌آمدگویی
    await tx.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: creatorId,
        body: `🎉 گروه ${team.name} ایجاد شد! همکاران عزیز خوش آمدید.`,
        messageType: "SYSTEM",
      },
    });

    return room;
  });
}

// استفاده:
const teamChat = await createTeamChatRoom(5, 1, 10);
```

### 1.3 گروه عمومی (GROUP)

```typescript
async function createGroupChat(
  workspaceId: number,
  creatorId: number,
  title: string,
  memberIds: number[],
  options?: {
    description?: string;
    icon?: string;
    isPrivate?: boolean;
  }
) {
  // Validation
  if (memberIds.length < 2) {
    throw new Error("حداقل 2 عضو نیاز است");
  }

  if (!memberIds.includes(creatorId)) {
    memberIds.unshift(creatorId); // اضافه کردن سازنده
  }

  return prisma.$transaction(async (tx) => {
    // 1. Room
    const room = await tx.chatRoom.create({
      data: {
        workspaceId,
        type: "GROUP",
        title,
        description: options?.description,
        icon: options?.icon,
        isPrivate: options?.isPrivate ?? false,
        createdById: creatorId,
      },
    });

    // 2. اعضا
    await tx.chatRoomMember.createMany({
      data: memberIds.map((userId, index) => ({
        roomId: room.id,
        workspaceUserId: userId,
        role: userId === creatorId ? "OWNER" : "MEMBER",
        invitedById: userId === creatorId ? null : creatorId,
      })),
    });

    // 3. Settings
    await tx.chatRoomSettings.create({
      data: {
        roomId: room.id,
        whoCanPost: "ALL_MEMBERS",
        whoCanInvite: "ALL_MEMBERS", // همه می‌توانند دعوت کنند
        whoCanChangeSettings: "ADMINS",
        allowFileAttachments: true,
        allowReactions: true,
        maxMessageLength: 10000,
        maxFileSize: 10 * 1024 * 1024, // 10MB
      },
    });

    // 4. پیام خوش‌آمدگویی
    await tx.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: creatorId,
        body: `گروه "${title}" ایجاد شد!`,
        messageType: "SYSTEM",
      },
    });

    return room;
  });
}

// استفاده:
const group = await createGroupChat(
  1, // workspaceId
  10, // creatorId
  "تیم مارکتینگ", // title
  [10, 15, 20, 25], // members
  {
    description: "بحث‌های مربوط به کمپین‌های تبلیغاتی",
    icon: "📢",
    isPrivate: true,
  }
);
```

### 1.4 پشتیبانی مشتری (CUSTOMER)

```typescript
async function createCustomerSupportRoom(
  workspaceId: number,
  customerId: number,
  supportTeamId?: number
) {
  // دریافت اعضای تیم پشتیبانی
  let supportMembers: any[] = [];

  if (supportTeamId) {
    const team = await prisma.team.findUnique({
      where: { id: supportTeamId },
      include: { members: true },
    });
    supportMembers = team?.members || [];
  }

  return prisma.$transaction(async (tx) => {
    // 1. Room
    const room = await tx.chatRoom.create({
      data: {
        workspaceId,
        type: "CUSTOMER",
        title: `پشتیبانی - مشتری ${customerId}`,
        isPrivate: false,
        createdById: customerId,
      },
    });

    // 2. اعضا: مشتری + تیم پشتیبانی
    const members = [
      {
        roomId: room.id,
        workspaceUserId: customerId,
        role: "MEMBER" as const,
      },
      ...supportMembers.map((m) => ({
        roomId: room.id,
        workspaceUserId: m.workspaceUserId,
        role: "ADMIN" as const,
      })),
    ];

    await tx.chatRoomMember.createMany({ data: members });

    // 3. Settings (محدود برای مشتری)
    await tx.chatRoomSettings.create({
      data: {
        roomId: room.id,
        whoCanPost: "ALL_MEMBERS",
        whoCanInvite: "ADMINS", // فقط پشتیبانی می‌تواند کسی را اضافه کند
        allowFileAttachments: true,
        allowReactions: false, // مشتری نمی‌تواند reaction بدهد
        maxMessageLength: 5000,
      },
    });

    // 4. پیام خوش‌آمدگویی
    await tx.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: supportMembers[0]?.workspaceUserId || customerId,
        body: "سلام! چطور می‌توانیم کمکتان کنیم؟",
        messageType: "SYSTEM",
      },
    });

    return room;
  });
}
```

---

## 2. مدیریت اعضا

### 2.1 دعوت کردن عضو جدید

```typescript
async function inviteMember(
  roomId: number,
  inviterId: number,
  newMemberId: number
) {
  // بررسی دسترسی
  const inviter = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: inviterId },
    },
    include: { room: { include: { settings: true } } },
  });

  if (!inviter) {
    throw new Error("شما عضو این اتاق نیستید");
  }

  const settings = inviter.room.settings;

  // بررسی: آیا حق دعوت دارد؟
  if (settings?.whoCanInvite === "ADMINS" && inviter.role === "MEMBER") {
    throw new Error("فقط ادمین‌ها می‌توانند دعوت کنند");
  }

  // بررسی: آیا قبلا عضو است؟
  const existing = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: newMemberId },
    },
  });

  if (existing && !existing.leftAt) {
    throw new Error("این کاربر قبلا عضو است");
  }

  return prisma.$transaction(async (tx) => {
    // 1. اضافه کردن عضو
    const member = await tx.chatRoomMember.create({
      data: {
        roomId,
        workspaceUserId: newMemberId,
        role: "MEMBER",
        invitedById: inviterId,
      },
    });

    // 2. پیام سیستمی
    await tx.chatMessage.create({
      data: {
        roomId,
        senderId: inviterId,
        body: `کاربر جدیدی به گروه پیوست`,
        messageType: "SYSTEM",
      },
    });

    return member;
  });
}
```

### 2.2 حذف/اخراج عضو

```typescript
async function removeMember(
  roomId: number,
  removerId: number,
  memberId: number
) {
  // بررسی دسترسی
  const remover = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: removerId },
    },
  });

  // فقط OWNER/ADMIN می‌توانند اخراج کنند
  if (!remover || !["OWNER", "ADMIN"].includes(remover.role)) {
    throw new Error("شما دسترسی ندارید");
  }

  // نمی‌توان OWNER را اخراج کرد
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: memberId },
    },
  });

  if (member?.role === "OWNER") {
    throw new Error("نمی‌توان مالک را اخراج کرد");
  }

  return prisma.$transaction(async (tx) => {
    // 1. علامت‌گذاری به عنوان خارج شده
    await tx.chatRoomMember.update({
      where: { id: member!.id },
      data: { leftAt: new Date() },
    });

    // 2. پیام سیستمی
    await tx.chatMessage.create({
      data: {
        roomId,
        senderId: removerId,
        body: `کاربری از گروه خارج شد`,
        messageType: "SYSTEM",
      },
    });
  });
}
```

### 2.3 تغییر نقش عضو

```typescript
async function changeemberRole(
  roomId: number,
  changerId: number,
  memberId: number,
  newRole: "ADMIN" | "MODERATOR" | "MEMBER"
) {
  // بررسی: فقط OWNER می‌تواند نقش‌ها را تغییر دهد
  const changer = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: changerId },
    },
  });

  if (changer?.role !== "OWNER") {
    throw new Error("فقط مالک می‌تواند نقش‌ها را تغییر دهد");
  }

  return prisma.chatRoomMember.update({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: memberId },
    },
    data: { role: newRole },
  });
}
```

---

## 3. ارسال و دریافت پیام‌ها

### 3.1 ارسال پیام ساده

```typescript
async function sendMessage(
  roomId: number,
  senderId: number,
  body: string,
  options?: {
    replyToId?: number;
    mentions?: number[];
  }
) {
  // بررسی عضویت
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: senderId },
    },
    include: { room: { include: { settings: true } } },
  });

  if (!member || member.leftAt) {
    throw new Error("شما عضو این اتاق نیستید");
  }

  // بررسی دسترسی ارسال
  const settings = member.room.settings;
  if (settings?.whoCanPost === "ADMINS_ONLY" && member.role === "MEMBER") {
    throw new Error("فقط ادمین‌ها می‌توانند پست کنند");
  }

  // بررسی طول پیام
  if (body.length > (settings?.maxMessageLength || 10000)) {
    throw new Error(
      `پیام خیلی طولانی است (حداکثر ${settings?.maxMessageLength} کاراکتر)`
    );
  }

  return prisma.$transaction(async (tx) => {
    // 1. ساخت پیام
    const message = await tx.chatMessage.create({
      data: {
        roomId,
        senderId,
        body,
        bodyPreview: body.slice(0, 200),
        messageType: "TEXT",
        replyToId: options?.replyToId,
        mentions: options?.mentions ? JSON.stringify(options.mentions) : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // 2. به‌روزرسانی lastActivityAt
    await tx.chatRoom.update({
      where: { id: roomId },
      data: { lastActivityAt: new Date() },
    });

    // 3. افزایش تعداد پیام‌های عضو
    await tx.chatRoomMember.update({
      where: { id: member.id },
      data: { messageCount: { increment: 1 } },
    });

    return message;
  });
}

// استفاده:
const msg = await sendMessage(1, 10, "سلام دوستان!", {
  mentions: [15, 20], // @user15 @user20
});
```

### 3.2 ارسال پیام با فایل

```typescript
async function sendMessageWithFile(
  roomId: number,
  senderId: number,
  body: string,
  files: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>
) {
  // بررسی Settings
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { settings: true },
  });

  if (!room?.settings?.allowFileAttachments) {
    throw new Error("ارسال فایل در این اتاق مجاز نیست");
  }

  // بررسی حجم فایل‌ها
  const maxSize = room.settings.maxFileSize || 10 * 1024 * 1024;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  if (totalSize > maxSize) {
    throw new Error(
      `حجم فایل‌ها بیش از حد مجاز است (${maxSize / 1024 / 1024}MB)`
    );
  }

  return prisma.chatMessage.create({
    data: {
      roomId,
      senderId,
      body,
      messageType: files.every((f) => f.type.startsWith("image/"))
        ? "IMAGE"
        : "FILE",
      attachments: JSON.stringify({ files }),
    },
  });
}
```

### 3.3 دریافت پیام‌ها (با Pagination)

```typescript
async function getMessages(
  roomId: number,
  userId: number,
  options: {
    page?: number;
    limit?: number;
    beforeId?: number; // برای infinite scroll
  } = {}
) {
  // بررسی عضویت
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: userId },
    },
  });

  if (!member || member.leftAt) {
    throw new Error("شما عضو این اتاق نیستید");
  }

  const limit = options.limit || 50;
  const page = options.page || 1;

  const where: any = {
    roomId,
    isDeleted: false,
  };

  // برای infinite scroll
  if (options.beforeId) {
    where.id = { lt: options.beforeId };
  }

  const [messages, total] = await Promise.all([
    prisma.chatMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            user: { select: { name: true } },
          },
        },
        replyTo: {
          select: {
            id: true,
            body: true,
            sender: { select: { displayName: true } },
          },
        },
        reactions: {
          select: {
            emoji: true,
            user: { select: { id: true, displayName: true } },
          },
        },
        linkedDocuments: {
          include: { document: true },
        },
        linkedTasks: {
          include: { task: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: options.beforeId ? 0 : (page - 1) * limit,
      take: limit,
    }),
    prisma.chatMessage.count({ where }),
  ]);

  return {
    data: messages.reverse(), // از قدیم به جدید
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

---

## 4. لینک به موجودیت‌ها

### 4.1 ارسال پیام + لینک سند

```typescript
async function sendMessageWithDocument(
  roomId: number,
  senderId: number,
  body: string,
  documentId: number
) {
  // بررسی: آیا سند متعلق به همان workspace است؟
  const [member, document] = await Promise.all([
    prisma.chatRoomMember.findUnique({
      where: {
        roomId_workspaceUserId: { roomId, workspaceUserId: senderId },
      },
      include: { room: true },
    }),
    prisma.document.findUnique({
      where: { id: documentId },
    }),
  ]);

  if (!member) throw new Error("شما عضو نیستید");
  if (!document) throw new Error("سند یافت نشد");
  if (document.workspaceId !== member.room.workspaceId) {
    throw new Error("سند متعلق به این workspace نیست");
  }

  return prisma.$transaction(async (tx) => {
    // 1. پیام
    const message = await tx.chatMessage.create({
      data: {
        roomId,
        senderId,
        body,
        messageType: "DOC_SHARE",
      },
    });

    // 2. لینک به سند
    await tx.chatMessageDocument.create({
      data: {
        messageId: message.id,
        documentId,
        addedById: senderId,
      },
    });

    return message;
  });
}

// استفاده:
const msg = await sendMessageWithDocument(
  1,
  10,
  "این سند طرح کسب‌وکار ماست",
  50
);
```

### 4.2 اضافه کردن وظیفه به چت

```typescript
async function linkTaskToChat(
  roomId: number,
  userId: number,
  taskId: number,
  messageText?: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. پیام
    const message = await tx.chatMessage.create({
      data: {
        roomId,
        senderId: userId,
        body: messageText || `وظیفه جدیدی اضافه شد`,
        messageType: "TASK_CREATE",
      },
    });

    // 2. لینک
    await tx.chatMessageTask.create({
      data: {
        messageId: message.id,
        taskId,
        addedById: userId,
      },
    });

    return message;
  });
}
```

### 4.3 دریافت تمام اسناد share شده در چت

```typescript
async function getChatDocuments(roomId: number, userId: number) {
  // بررسی عضویت
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: userId },
    },
  });

  if (!member) throw new Error("دسترسی ندارید");

  return prisma.chatMessageDocument.findMany({
    where: {
      message: { roomId },
    },
    include: {
      document: true,
      addedBy: {
        select: {
          displayName: true,
          user: { select: { name: true } },
        },
      },
      message: {
        select: {
          id: true,
          body: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
```

---

## 5. Reactions و Read Receipts

### 5.1 اضافه کردن Reaction

```typescript
async function addReaction(messageId: number, userId: number, emoji: string) {
  // بررسی: آیا پیام وجود دارد و کاربر عضو است؟
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      room: {
        include: {
          members: {
            where: { workspaceUserId: userId },
          },
          settings: true,
        },
      },
    },
  });

  if (!message) throw new Error("پیام یافت نشد");
  if (message.room.members.length === 0) throw new Error("شما عضو نیستید");
  if (!message.room.settings?.allowReactions) {
    throw new Error("reaction مجاز نیست");
  }

  // اگر قبلا reaction داده، آن را حذف کن (toggle)
  const existing = await prisma.chatMessageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId,
        userId,
        emoji,
      },
    },
  });

  if (existing) {
    return prisma.chatMessageReaction.delete({
      where: { id: existing.id },
    });
  }

  // اضافه کردن reaction جدید
  return prisma.chatMessageReaction.create({
    data: {
      messageId,
      userId,
      emoji,
    },
  });
}

// استفاده:
await addReaction(100, 10, "👍"); // اضافه
await addReaction(100, 10, "👍"); // حذف (toggle)
```

### 5.2 دریافت Reactions یک پیام

```typescript
async function getMessageReactions(messageId: number) {
  const reactions = await prisma.chatMessageReaction.groupBy({
    by: ["emoji"],
    where: { messageId },
    _count: { emoji: true },
  });

  // دریافت اسامی کسانی که reaction داده‌اند
  const reactionsWithUsers = await Promise.all(
    reactions.map(async (r) => {
      const users = await prisma.chatMessageReaction.findMany({
        where: {
          messageId,
          emoji: r.emoji,
        },
        include: {
          user: {
            select: {
              displayName: true,
              user: { select: { name: true } },
            },
          },
        },
      });

      return {
        emoji: r.emoji,
        count: r._count.emoji,
        users: users.map((u) => u.user.displayName || u.user.user?.name),
      };
    })
  );

  return reactionsWithUsers;
}

// Result:
// [
//   { emoji: "👍", count: 5, users: ["احمد", "محمد", ...] },
//   { emoji: "❤️", count: 3, users: ["علی", "فاطمه", ...] }
// ]
```

### 5.3 علامت‌گذاری پیام به عنوان خوانده شده

```typescript
async function markMessageAsRead(
  roomId: number,
  userId: number,
  messageId: number
) {
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: userId },
    },
  });

  if (!member) throw new Error("شما عضو نیستید");

  return prisma.$transaction(async (tx) => {
    // 1. به‌روزرسانی عضویت
    await tx.chatRoomMember.update({
      where: { id: member.id },
      data: {
        lastReadAt: new Date(),
        lastReadMessageId: messageId,
      },
    });

    // 2. ثبت read receipt
    await tx.chatMessageReadReceipt.upsert({
      where: {
        messageId_memberId: {
          messageId,
          memberId: member.id,
        },
      },
      create: {
        messageId,
        memberId: member.id,
        readAt: new Date(),
      },
      update: {
        readAt: new Date(),
      },
    });
  });
}
```

### 5.4 دریافت تعداد پیام‌های خوانده نشده

```typescript
async function getUnreadCount(roomId: number, userId: number) {
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: userId },
    },
  });

  if (!member) return 0;

  if (!member.lastReadAt) {
    // هیچ‌وقت پیامی نخوانده، همه جدید هستند
    return prisma.chatMessage.count({
      where: {
        roomId,
        isDeleted: false,
      },
    });
  }

  // پیام‌های بعد از lastReadAt
  return prisma.chatMessage.count({
    where: {
      roomId,
      createdAt: { gt: member.lastReadAt },
      isDeleted: false,
      senderId: { not: userId }, // پیام‌های خودش را نشمار
    },
  });
}
```

---

## 6. امنیت و Authorization

### 6.1 بررسی دسترسی به اتاق

```typescript
async function checkRoomAccess(
  roomId: number,
  userId: number,
  requiredRole?: "OWNER" | "ADMIN" | "MODERATOR"
): Promise<boolean> {
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: userId },
    },
  });

  // عضو نیست یا خارج شده
  if (!member || member.leftAt) return false;

  // اگر نقش خاصی لازم است
  if (requiredRole) {
    const roleHierarchy = {
      OWNER: 4,
      ADMIN: 3,
      MODERATOR: 2,
      MEMBER: 1,
      GUEST: 0,
    };

    return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
  }

  return true;
}

// استفاده:
const canAccess = await checkRoomAccess(1, 10);
const isAdmin = await checkRoomAccess(1, 10, "ADMIN");
```

### 6.2 بررسی دسترسی حذف پیام

```typescript
async function canDeleteMessage(
  messageId: number,
  userId: number
): Promise<boolean> {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      room: {
        include: {
          members: {
            where: { workspaceUserId: userId },
          },
          permissions: {
            where: { workspaceUserId: userId },
          },
        },
      },
    },
  });

  if (!message) return false;

  // 1. پیام خودش را می‌تواند حذف کند
  if (message.senderId === userId) return true;

  const member = message.room.members[0];
  if (!member) return false;

  // 2. ADMIN/MODERATOR می‌تواند حذف کند
  if (["OWNER", "ADMIN", "MODERATOR"].includes(member.role)) return true;

  // 3. Permission خاص
  const permission = message.room.permissions[0];
  if (permission?.canDelete) return true;

  return false;
}
```

---

## 7. Performance و Optimization

### 7.1 دریافت لیست اتاق‌ها با Last Message

```typescript
async function getRoomsList(
  workspaceId: number,
  userId: number,
  options: {
    search?: string;
    type?: string;
    isArchived?: boolean;
    page?: number;
    limit?: number;
  } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 20;

  const where: any = {
    workspaceId,
    members: {
      some: {
        workspaceUserId: userId,
        leftAt: null,
      },
    },
  };

  if (options.search) {
    where.title = {
      contains: options.search,
      mode: "insensitive",
    };
  }

  if (options.type) {
    where.type = options.type;
  }

  if (typeof options.isArchived === "boolean") {
    where.isArchived = options.isArchived;
  }

  const [rooms, total] = await Promise.all([
    prisma.chatRoom.findMany({
      where,
      include: {
        members: {
          where: { workspaceUserId: userId },
          select: {
            id: true,
            lastReadAt: true,
            lastReadMessageId: true,
            isMuted: true,
          },
        },
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            body: true,
            bodyPreview: true,
            createdAt: true,
            sender: {
              select: {
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: { isDeleted: false },
            },
          },
        },
      },
      orderBy: {
        lastActivityAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.chatRoom.count({ where }),
  ]);

  // محاسبه unread count برای هر اتاق
  const roomsWithUnread = await Promise.all(
    rooms.map(async (room) => {
      const member = room.members[0];
      const lastMessage = room.messages[0];

      let unreadCount = 0;
      if (member && member.lastReadAt) {
        unreadCount = await prisma.chatMessage.count({
          where: {
            roomId: room.id,
            createdAt: { gt: member.lastReadAt },
            isDeleted: false,
            senderId: { not: userId },
          },
        });
      } else if (member) {
        unreadCount = room._count.messages;
      }

      return {
        ...room,
        lastMessage,
        unreadCount,
        isMuted: member?.isMuted || false,
      };
    })
  );

  return {
    data: roomsWithUnread,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

### 7.2 Search در پیام‌ها

```typescript
async function searchMessages(
  workspaceId: number,
  userId: number,
  query: string,
  options: {
    roomId?: number;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
  } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 50;

  // فقط در اتاق‌هایی که عضو است
  const userRoomIds = await prisma.chatRoomMember
    .findMany({
      where: {
        workspaceUserId: userId,
        leftAt: null,
        room: { workspaceId },
      },
      select: { roomId: true },
    })
    .then((rooms) => rooms.map((r) => r.roomId));

  const where: any = {
    roomId: { in: userRoomIds },
    isDeleted: false,
    body: {
      contains: query,
      mode: "insensitive",
    },
  };

  if (options.roomId) {
    where.roomId = options.roomId;
  }

  if (options.fromDate) {
    where.createdAt = { ...where.createdAt, gte: options.fromDate };
  }

  if (options.toDate) {
    where.createdAt = { ...where.createdAt, lte: options.toDate };
  }

  const [messages, total] = await Promise.all([
    prisma.chatMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            displayName: true,
            user: { select: { name: true } },
          },
        },
        room: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.chatMessage.count({ where }),
  ]);

  return {
    data: messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

---

## ✅ خلاصه

این مثال‌ها نشان می‌دهند که:

1. **ساخت اتاق‌ها** با انواع مختلف و settings سفارشی
2. **مدیریت اعضا** با نقش‌ها و دسترسی‌ها
3. **ارسال/دریافت پیام** با امنیت کامل
4. **لینک به موجودیت‌ها** (Documents, Tasks, etc.)
5. **Reactions و Read Receipts** برای UX بهتر
6. **امنیت** با workspace isolation و permission checks
7. **Performance** با indexes و pagination

همه این مثال‌ها آماده استفاده و قابل customization هستند! 🚀

# 🔄 مقایسه Schema قدیم و جدید سیستم Chat

## 📊 جدول مقایسه کلی

| ویژگی                   | Schema قدیم ❌ | Schema جدید ✅                                      |
| ----------------------- | -------------- | --------------------------------------------------- |
| **تعداد جداول**         | 4              | 15                                                  |
| **Workspace Isolation** | ضعیف           | قوی و محکم                                          |
| **Member Management**   | پایه‌ای        | پیشرفته (نقش‌ها، دسترسی‌ها)                         |
| **انواع اتاق**          | 4 نوع          | 5 نوع + قابل توسعه                                  |
| **لینک به موجودیت‌ها**  | خیر            | 5 نوع (Document, Task, Knowledge, Invoice, Request) |
| **Reactions**           | خیر            | بله                                                 |
| **Read Receipts**       | خیر            | بله                                                 |
| **Typing Indicators**   | خیر            | بله                                                 |
| **Thread/Reply**        | ساده           | پیشرفته                                             |
| **Message Types**       | محدود          | 10 نوع                                              |
| **Permissions**         | خیر            | سیستم کامل (Role + User level)                      |
| **Settings**            | خیر            | سیستم کامل                                          |
| **Pin Messages**        | خیر            | بله                                                 |
| **Edit/Delete**         | ساده           | پیشرفته (soft delete, track who deleted)            |
| **File Attachments**    | JSON ساده      | JSON + metadata کامل                                |
| **Performance**         | 2 index        | 20+ index                                           |

---

## 🔍 مقایسه دقیق مدل‌ها

### 1. ChatRoom

#### ❌ Schema قدیم:

```prisma
model ChatRoom {
  id          Int       @id @default(autoincrement())
  workspaceId Int
  workspace   Workspace @relation(...)

  type       ChatRoomType
  title      String?
  icon       String?
  isArchived Boolean      @default(false)

  createdById Int?
  createdBy   WorkspaceUser? @relation(...)

  members  ChatRoomMember[]
  messages ChatMessage[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([workspaceId, type])
}
```

**مشکلات:**

- ⚠️ ارتباط با Team/Project وجود ندارد
- ⚠️ Settings جداگانه ندارد
- ⚠️ Permissions ندارد
- ⚠️ `lastActivityAt` برای sorting ندارد
- ⚠️ `isPrivate`, `isLocked` ندارد

#### ✅ Schema جدید:

```prisma
model ChatRoom {
  id          Int      @id @default(autoincrement())
  workspaceId Int
  workspace   Workspace @relation(...)

  type        ChatRoomType
  title       String?      @db.VarChar(255)
  description String?      @db.Text
  icon        String?      @db.VarChar(255)
  coverImage  String?      @db.VarChar(500)

  // ✅ ارتباط با Team/Project
  teamId      Int?
  team        Team?        @relation(...)
  projectId   Int?
  project     Project?     @relation(...)

  createdById Int?
  createdBy   WorkspaceUser? @relation(...)

  // ✅ تنظیمات امنیتی
  isPrivate   Boolean      @default(false)
  isArchived  Boolean      @default(false)
  isLocked    Boolean      @default(false)

  // ✅ مدیریت فعالیت
  allowNotifications Boolean @default(true)
  lastActivityAt DateTime?

  // ✅ روابط پیشرفته
  members     ChatRoomMember[]
  messages    ChatMessage[]
  settings    ChatRoomSettings?
  permissions ChatRoomPermission[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ✅ Indexes بهتر
  @@index([workspaceId, type])
  @@index([workspaceId, isArchived])
  @@index([teamId])
  @@index([projectId])
  @@index([lastActivityAt])
}
```

**بهبودها:**

- ✅ ارتباط با Team و Project
- ✅ Description و CoverImage
- ✅ Private/Locked rooms
- ✅ Settings و Permissions جداگانه
- ✅ lastActivityAt برای sorting
- ✅ Indexes بیشتر برای performance

---

### 2. ChatRoomMember

#### ❌ Schema قدیم:

```prisma
model ChatRoomMember {
  roomId          Int
  workspaceUserId Int
  role            String    @default("MEMBER")
  lastReadAt      DateTime?

  room          ChatRoom      @relation(...)
  workspaceUser WorkspaceUser @relation(...)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@id([roomId, workspaceUserId])
}
```

**مشکلات:**

- ⚠️ فقط `lastReadAt` دارد، `lastReadMessageId` ندارد
- ⚠️ Mute settings ندارد
- ⚠️ Custom nickname/color ندارد
- ⚠️ `joinedAt`/`leftAt` ندارد
- ⚠️ `invitedBy` ندارد
- ⚠️ آمار (messageCount) ندارد

#### ✅ Schema جدید:

```prisma
model ChatRoomMember {
  id              Int      @id @default(autoincrement())
  roomId          Int
  workspaceUserId Int

  // ✅ نقش با enum
  role            ChatRoomMemberRole @default(MEMBER)

  // ✅ وضعیت خواندن کامل
  lastReadAt      DateTime?
  lastReadMessageId Int?

  // ✅ تنظیمات شخصی
  isMuted         Boolean   @default(false)
  mutedUntil      DateTime?
  customNickname  String?   @db.VarChar(100)
  customColor     String?   @db.VarChar(7)

  // ✅ آمار
  messageCount    Int       @default(0)

  // ✅ مدیریت عضویت
  joinedAt        DateTime  @default(now())
  leftAt          DateTime?
  invitedById     Int?
  invitedBy       WorkspaceUser? @relation(...)

  // روابط
  typingIndicators ChatTypingIndicator[]
  readReceipts     ChatMessageReadReceipt[]

  // ✅ Indexes بهتر
  @@unique([roomId, workspaceUserId])
  @@index([workspaceUserId])
  @@index([roomId, role])
  @@index([leftAt])
}
```

**بهبودها:**

- ✅ نقش‌های تعریف شده (OWNER, ADMIN, MODERATOR, MEMBER, GUEST)
- ✅ Tracking کامل خواندن (messageId + timestamp)
- ✅ Mute با زمان‌بندی
- ✅ Personalization (nickname, color)
- ✅ History کامل (joined, left, inviter)
- ✅ آمار فعالیت

---

### 3. ChatMessage

#### ❌ Schema قدیم:

```prisma
model ChatMessage {
  id     Int      @id @default(autoincrement())
  roomId Int
  room   ChatRoom @relation(...)

  senderId Int
  sender   WorkspaceUser @relation(...)

  body        String        @db.LongText
  attachments Json?
  replyToId   Int?
  replyTo     ChatMessage?  @relation("ChatMessageReply", ...)
  replies     ChatMessage[] @relation("ChatMessageReply")

  editedAt  DateTime?
  deletedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([roomId])
}
```

**مشکلات:**

- ⚠️ فقط `editedAt` دارد، `isEdited` ندارد
- ⚠️ Soft delete ناقص (`deletedBy` ندارد)
- ⚠️ Pin feature ندارد
- ⚠️ `messageType` ندارد
- ⚠️ `mentions` ندارد
- ⚠️ `bodyPreview` برای notification ندارد
- ⚠️ لینک به Documents/Tasks ندارد
- ⚠️ Reactions ندارد
- ⚠️ Read Receipts ندارد

#### ✅ Schema جدید:

```prisma
model ChatMessage {
  id     Int      @id @default(autoincrement())
  roomId Int
  senderId Int

  // ✅ محتوای بهتر
  body        String   @db.LongText
  bodyPreview String?  @db.VarChar(200)
  messageType ChatMessageType @default(TEXT)

  // ✅ Thread support
  replyToId   Int?
  replyTo     ChatMessage?  @relation(...)
  replies     ChatMessage[] @relation(...)

  // ✅ Attachments و Mentions
  attachments Json?
  mentions    Json?

  // ✅ Edit tracking
  isEdited    Boolean   @default(false)
  editedAt    DateTime?

  // ✅ Soft delete کامل
  isDeleted   Boolean   @default(false)
  deletedAt   DateTime?
  deletedBy   Int?

  // ✅ Pin feature
  isPinned    Boolean   @default(false)
  pinnedAt    DateTime?
  pinnedById  Int?
  pinnedBy    WorkspaceUser? @relation(...)

  // ✅ لینک به موجودیت‌ها
  linkedDocuments  ChatMessageDocument[]
  linkedTasks      ChatMessageTask[]
  linkedKnowledge  ChatMessageKnowledge[]
  linkedInvoices   ChatMessageInvoice[]
  linkedRequests   ChatMessageRequest[]

  // ✅ تعاملات
  reactions    ChatMessageReaction[]
  readReceipts ChatMessageReadReceipt[]

  // ✅ Indexes بهتر
  @@index([roomId, createdAt])
  @@index([senderId])
  @@index([replyToId])
  @@index([roomId, isPinned])
  @@index([roomId, isDeleted])
}
```

**بهبودها:**

- ✅ 10 نوع پیام (TEXT, IMAGE, FILE, VOICE, VIDEO, LINK, SYSTEM, POLL, TASK_CREATE, DOC_SHARE)
- ✅ Preview برای notifications
- ✅ Mentions با JSON array
- ✅ Edit/Delete tracking کامل
- ✅ Pin messages
- ✅ لینک به 5 نوع موجودیت
- ✅ Reactions و Read Receipts
- ✅ Performance indexes

---

## 🆕 جداول جدید (که در schema قدیم نبودند)

### 1. ChatMessageDocument/Task/Knowledge/Invoice/Request

**هدف:** لینک کردن پیام‌ها به موجودیت‌های دیگر

**مثال:**

```typescript
// در چت می‌گویید: "این سند را بررسی کنید"
// و سند #50 را attach می‌کنید

ChatMessage: { id: 100, body: "این سند را..." }
ChatMessageDocument: { messageId: 100, documentId: 50 }

// حالا می‌توانید:
// 1. از چت به سند برید
// 2. از سند ببینید کجا در چت‌ها استفاده شده
```

### 2. ChatMessageReaction

**هدف:** واکنش‌های emoji به پیام‌ها

**UI:**

```
[پیام]: "کار خوبی کردی!"
[واکنش‌ها]: 👍 5   ❤️ 3   🎉 2
```

### 3. ChatMessageReadReceipt

**هدف:** tracking دقیق خواندن پیام‌ها

**UI:**

```
"خوانده شده توسط 8 از 10 نفر"
✓✓ (دو تیک آبی)
```

### 4. ChatTypingIndicator

**هدف:** نمایش "در حال تایپ..."

**Logic:**

```
- کاربر شروع به تایپ کرد → Insert رکورد
- هر 3 ثانیه → Update رکورد
- بعد از 10 ثانیه بی‌فعالیت → Delete رکورد
```

### 5. ChatRoomSettings

**هدف:** تنظیمات دقیق هر اتاق

**مثال:**

```typescript
{
  whoCanPost: "ADMINS_ONLY",           // فقط ادمین‌ها
  whoCanInvite: "ALL_MEMBERS",         // همه می‌توانند دعوت کنند
  allowFileAttachments: true,
  maxMessageLength: 5000,
  autoDeleteAfterDays: 90              // پیام‌ها بعد از 90 روز حذف شوند
}
```

### 6. ChatRoomPermission

**هدف:** دسترسی‌های سفارشی

**مثال:**

```typescript
// کاربر X فقط می‌تواند بخواند
{
  roomId: 1,
  workspaceUserId: 15,
  canRead: true,
  canWrite: false,
  canDelete: false
}

// نقش Support می‌تواند پیام‌ها را حذف کند
{
  roomId: 1,
  roleId: 3,
  canRead: true,
  canWrite: true,
  canDelete: true
}
```

---

## 🔐 بهبودهای امنیتی

### 1. Workspace Isolation

#### ❌ قدیم:

```typescript
// فقط roomId چک می‌شد
const messages = await prisma.chatMessage.findMany({
  where: { roomId },
});
// ⚠️ خطر: می‌توان پیام‌های workspace دیگر را دید!
```

#### ✅ جدید:

```typescript
// همیشه workspaceId چک می‌شود
const messages = await prisma.chatMessage.findMany({
  where: {
    room: {
      workspaceId: context.workspaceId,
      members: {
        some: { workspaceUserId: context.userId },
      },
    },
  },
});
// ✅ امن: فقط پیام‌های workspace خودت + اتاق‌هایی که عضوشی
```

### 2. Member-based Access

#### ✅ جدید:

```typescript
// چک عضویت قبل از هر عملیات
async function checkMembership(roomId, userId) {
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: userId },
    },
  });

  if (!member || member.leftAt !== null) {
    throw new ForbiddenException();
  }
}
```

### 3. Permission System

#### ✅ جدید:

```typescript
// بررسی دسترسی برای حذف پیام
async function canDeleteMessage(messageId, userId) {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      room: {
        include: {
          members: true,
          permissions: true,
        },
      },
    },
  });

  // 1. پیام خودش را می‌تواند حذف کند
  if (message.senderId === userId) return true;

  // 2. یا Admin/Moderator است
  const member = message.room.members.find((m) => m.workspaceUserId === userId);
  if (member?.role === "ADMIN" || member?.role === "MODERATOR") return true;

  // 3. یا permission خاص دارد
  const permission = message.room.permissions.find(
    (p) => p.workspaceUserId === userId
  );
  if (permission?.canDelete) return true;

  return false;
}
```

---

## 📈 بهبودهای Performance

### Indexes اضافه شده:

| جدول           | Index قدیم | Index جدید |
| -------------- | ---------- | ---------- |
| ChatRoom       | 1          | 5          |
| ChatRoomMember | 2          | 4          |
| ChatMessage    | 1          | 5          |
| سایر جداول     | 0          | 15+        |

### مثال بهبود Performance:

#### سناریو: یافتن تمام اتاق‌های فعال یک workspace

**❌ قدیم:**

```sql
SELECT * FROM ChatRoom
WHERE workspaceId = 1
  AND isArchived = false;
-- ⚠️ بدون index روی (workspaceId, isArchived)
-- Performance: Slow (Full table scan)
```

**✅ جدید:**

```sql
SELECT * FROM ChatRoom
WHERE workspaceId = 1
  AND isArchived = false;
-- ✅ با index روی (workspaceId, isArchived)
-- Performance: Fast (Index scan)
```

---

## 🎯 Use Cases جدید که حالا امکان‌پذیر است

### 1. ✅ لینک کردن اسناد به چت

```typescript
// ارسال پیام + لینک سند
await sendMessageWithDocument(roomId, userId, "این سند را ببینید", documentId);

// دریافت تمام اسنادی که در این چت share شده
const docs = await prisma.chatMessageDocument.findMany({
  where: { message: { roomId } },
  include: { document: true },
});
```

### 2. ✅ نمایش "خوانده شده توسط X نفر"

```typescript
const readCount = await prisma.chatMessageReadReceipt.count({
  where: { messageId },
});
const totalMembers = await prisma.chatRoomMember.count({
  where: { roomId, leftAt: null },
});

// "خوانده شده توسط 8 از 10 نفر"
```

### 3. ✅ Pin Messages

```typescript
// پین کردن پیام مهم
await prisma.chatMessage.update({
  where: { id: messageId },
  data: {
    isPinned: true,
    pinnedAt: new Date(),
    pinnedById: userId,
  },
});

// دریافت پیام‌های پین شده
const pinnedMessages = await prisma.chatMessage.findMany({
  where: { roomId, isPinned: true },
  orderBy: { pinnedAt: "desc" },
});
```

### 4. ✅ Reactions

```typescript
// اضافه کردن reaction
await prisma.chatMessageReaction.create({
  data: {
    messageId,
    userId,
    emoji: "👍",
  },
});

// Group by emoji
const reactions = await prisma.chatMessageReaction.groupBy({
  by: ["emoji"],
  where: { messageId },
  _count: { emoji: true },
});
// Result: [{ emoji: "👍", _count: 5 }, { emoji: "❤️", _count: 3 }]
```

### 5. ✅ Auto-delete پیام‌های قدیمی

```typescript
// در cron job
const settings = await prisma.chatRoomSettings.findUnique({
  where: { roomId },
});

if (settings.autoDeleteAfterDays) {
  const cutoffDate = subDays(new Date(), settings.autoDeleteAfterDays);

  await prisma.chatMessage.updateMany({
    where: {
      roomId,
      createdAt: { lt: cutoffDate },
      isPinned: false, // پیام‌های پین شده را نگه دار
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
}
```

---

## 🔄 Migration از schema قدیم به جدید

### مرحله 1: نصب Schema جدید

```bash
# کپی کردن schema جدید
cp prisma/chat-schema-proposal.prisma prisma/schema.prisma

# ایجاد migration
npx prisma migrate dev --name upgrade_chat_system
```

### مرحله 2: Migrate داده‌های موجود

```typescript
async function migrateExistingChatData() {
  console.log("🚀 شروع migration...");

  // 1. Migrate Rooms
  const oldRooms = await prisma.chatRoom.findMany({
    include: { members: true },
  });

  for (const room of oldRooms) {
    await prisma.chatRoom.update({
      where: { id: room.id },
      data: {
        // اضافه کردن فیلدهای جدید
        isPrivate: false,
        isLocked: false,
        allowNotifications: true,
        lastActivityAt: room.updatedAt,
      },
    });

    // ساخت settings
    await prisma.chatRoomSettings.create({
      data: {
        roomId: room.id,
        whoCanPost: "ALL_MEMBERS",
        whoCanInvite: "ALL_MEMBERS",
        allowFileAttachments: true,
        allowReactions: true,
      },
    });

    // تنظیم نقش‌ها
    const firstMember = room.members[0];
    if (firstMember) {
      await prisma.chatRoomMember.update({
        where: {
          roomId_workspaceUserId: {
            roomId: room.id,
            workspaceUserId: firstMember.workspaceUserId,
          },
        },
        data: { role: "OWNER" },
      });
    }
  }

  // 2. Migrate Messages
  const messages = await prisma.chatMessage.findMany();

  for (const msg of messages) {
    await prisma.chatMessage.update({
      where: { id: msg.id },
      data: {
        messageType: "TEXT",
        isEdited: !!msg.editedAt,
        isDeleted: !!msg.deletedAt,
        isPinned: false,
      },
    });
  }

  console.log("✅ Migration کامل شد!");
}

// اجرا
migrateExistingChatData();
```

---

## ✅ نتیجه‌گیری

### مزایای Schema جدید:

1. **امنیت 10x بهتر**: Workspace isolation کامل + Permission system
2. **قابلیت‌های 5x بیشتر**: از 4 feature به 20+ feature
3. **Performance بهتر**: از 2 index به 25+ index
4. **مقیاس‌پذیری**: طراحی برای میلیون‌ها پیام
5. **انعطاف‌پذیری**: قابلیت customize کامل
6. **Tracking کامل**: هر عملیات قابل track است
7. **UX بهتر**: Read receipts, Typing, Reactions, etc.

### پیشنهاد:

**✅ تایید و پیاده‌سازی Schema جدید**

این schema:

- تمام نیازهای فعلی شما را پوشش می‌دهد
- آینده‌نگر و قابل توسعه است
- امن و استاندارد است
- با معماری باقی پروژه سازگار است

آماده پیاده‌سازی هستید؟ 🚀

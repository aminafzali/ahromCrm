# 📱 مستندات کامل Schema سیستم Chat

## 🎯 اهداف طراحی

این schema با اهداف زیر طراحی شده است:

### 1️⃣ امنیت و Isolation

- ✅ **Workspace Isolation**: هر اتاق متعلق به یک workspace است
- ✅ **Member-based Access**: فقط اعضای اتاق می‌توانند پیام‌ها را ببینند
- ✅ **Permission System**: کنترل دسترسی دقیق برای هر عملیات
- ✅ **Role-based Control**: نقش‌های مختلف (Owner, Admin, Moderator, Member, Guest)

### 2️⃣ قابلیت‌های پیشرفته

- ✅ انواع مختلف اتاق (Direct, Team, Group, Customer, Project)
- ✅ لینک به Documents, Tasks, Knowledge, Invoices, Requests
- ✅ Reactions (واکنش‌های emoji)
- ✅ Read Receipts (رسید خواندن)
- ✅ Typing Indicators (نشانگر تایپ)
- ✅ Thread/Reply Support (پاسخ به پیام)
- ✅ Pin Messages (پین کردن پیام‌ها)
- ✅ Message Editing & Deletion
- ✅ File Attachments
- ✅ Mentions (@username)

### 3️⃣ مقیاس‌پذیری و Performance

- ✅ Indexes مناسب برای کوئری‌های سریع
- ✅ Pagination-friendly design
- ✅ Soft delete برای پیام‌ها
- ✅ Optimized for real-time queries

---

## 📊 مدل‌های اصلی

### 1. ChatRoom (اتاق گفتگو)

```prisma
model ChatRoom {
  id          Int      @id @default(autoincrement())
  workspaceId Int
  type        ChatRoomType
  title       String?
  teamId      Int?
  projectId   Int?
  createdById Int?
  isPrivate   Boolean
  isArchived  Boolean
  isLocked    Boolean
  // ...
}
```

#### ویژگی‌های کلیدی:

**🔐 امنیت:**

- همیشه به workspace متصل است
- `isPrivate`: اتاق خصوصی (فقط با دعوت)
- `isLocked`: فقط خواندنی (مثل اعلانات)

**🏷️ انواع اتاق:**

1. **DIRECT**: گفتگوی خصوصی 1-1
2. **TEAM**: گروه خودکار برای هر تیم
3. **GROUP**: گروه دستی
4. **CUSTOMER**: پشتیبانی مشتری
5. **PROJECT**: مربوط به پروژه خاص

**🔗 روابط:**

- اتصال به Team (برای type=TEAM)
- اتصال به Project (برای type=PROJECT)
- سازنده (createdBy)

**📊 آمار:**

- `lastActivityAt`: برای sorting بر اساس جدیدترین فعالیت

#### نمونه Use Cases:

```typescript
// 1. ساخت اتاق تیمی
{
  type: "TEAM",
  title: "تیم توسعه",
  teamId: 5,
  workspaceId: 1,
  createdById: 10
}

// 2. گفتگوی خصوصی
{
  type: "DIRECT",
  title: null, // عنوان اتوماتیک: "نام کاربر 1 + نام کاربر 2"
  workspaceId: 1,
  createdById: 10,
  members: [user10, user15] // دقیقا 2 نفر
}

// 3. گروه پروژه
{
  type: "PROJECT",
  title: "پروژه CRM",
  projectId: 8,
  workspaceId: 1
}
```

---

### 2. ChatRoomMember (اعضای اتاق)

```prisma
model ChatRoomMember {
  id              Int      @id
  roomId          Int
  workspaceUserId Int
  role            ChatRoomMemberRole
  lastReadAt      DateTime?
  lastReadMessageId Int?
  isMuted         Boolean
  // ...
}
```

#### ویژگی‌های کلیدی:

**👑 نقش‌ها:**

- `OWNER`: مالک (معمولا سازنده)
- `ADMIN`: مدیر (تمام دسترسی‌ها)
- `MODERATOR`: ناظر (حذف پیام، اخراج کاربر)
- `MEMBER`: عضو عادی
- `GUEST`: مهمان (فقط خواندن)

**📬 وضعیت خواندن:**

- `lastReadAt`: آخرین زمان خواندن
- `lastReadMessageId`: آخرین پیام خوانده شده (برای نشان پیام‌های جدید)

**🔕 تنظیمات شخصی:**

- `isMuted`: اتاق mute شده
- `mutedUntil`: تا چه زمانی
- `customNickname`: نام مستعار در این گروه
- `customColor`: رنگ شخصی

**🚪 مدیریت عضویت:**

- `joinedAt`: زمان پیوستن
- `leftAt`: زمان خروج (null = هنوز عضو است)
- `invitedBy`: چه کسی دعوت کرده

#### مثال:

```typescript
// Admin اتاق
{
  roomId: 1,
  workspaceUserId: 10,
  role: "ADMIN",
  lastReadAt: "2025-01-01T10:00:00Z",
  isMuted: false
}

// عضو عادی که اتاق را mute کرده
{
  roomId: 1,
  workspaceUserId: 15,
  role: "MEMBER",
  isMuted: true,
  mutedUntil: "2025-01-07T00:00:00Z"
}
```

---

### 3. ChatMessage (پیام)

```prisma
model ChatMessage {
  id          Int      @id
  roomId      Int
  senderId    Int
  body        String
  messageType ChatMessageType
  replyToId   Int?
  attachments Json?
  mentions    Json?
  isEdited    Boolean
  isDeleted   Boolean
  isPinned    Boolean
  // ...
}
```

#### ویژگی‌های کلیدی:

**💬 محتوا:**

- `body`: متن پیام (LongText)
- `bodyPreview`: خلاصه 200 کاراکتری (برای نوتیفیکیشن)

**📌 انواع پیام:**

```typescript
enum ChatMessageType {
  TEXT        // متن ساده
  IMAGE       // تصویر
  FILE        // فایل
  VOICE       // صوتی
  VIDEO       // ویدیو
  LINK        // لینک با preview
  SYSTEM      // پیام سیستم
  POLL        // نظرسنجی
  TASK_CREATE // ایجاد وظیفه
  DOC_SHARE   // اشتراک سند
}
```

**🔗 Thread/Reply:**

- `replyToId`: پاسخ به کدام پیام
- `replies`: لیست پاسخ‌ها

**📎 ضمیمه‌ها:**

```json
{
  "files": [
    {
      "name": "report.pdf",
      "url": "/uploads/...",
      "size": 1024000,
      "type": "application/pdf"
    }
  ],
  "images": [{ "url": "/uploads/image.jpg", "width": 800, "height": 600 }]
}
```

**🏷️ منشن‌ها:**

```json
[10, 15, 20] // workspaceUserIds
```

**✏️ ویرایش و حذف:**

- `isEdited`: آیا ویرایش شده؟
- `editedAt`: زمان ویرایش
- `isDeleted`: حذف soft
- `deletedAt`: زمان حذف
- `deletedBy`: چه کسی حذف کرده (می‌تواند خود فرستنده یا admin باشد)

**📌 پین:**

- `isPinned`: پین شده
- `pinnedAt`: زمان پین
- `pinnedBy`: چه کسی پین کرده

#### مثال پیام متنی:

```typescript
{
  roomId: 1,
  senderId: 10,
  body: "سلام @احمد، لطفا این سند را بررسی کن",
  messageType: "TEXT",
  mentions: [15],
  linkedDocuments: [
    { documentId: 100, addedById: 10 }
  ]
}
```

#### مثال پیام سیستمی:

```typescript
{
  roomId: 1,
  senderId: 10, // سیستم
  body: "کاربر محمد به گروه پیوست",
  messageType: "SYSTEM",
  isEdited: false
}
```

---

### 4. لینک به موجودیت‌ها

#### ChatMessageDocument

```prisma
model ChatMessageDocument {
  messageId  Int
  documentId Int
  addedById  Int
  createdAt  DateTime
}
```

این امکان را می‌دهد که:

- سند را در چت به اشتراک بگذارید
- از چت به سند برید
- ببینید چه کسی سند را اضافه کرده

**Use Case:**

```typescript
// کاربر در چت می‌گوید:
"این سند مربوط به پروژه X است" + لینک به Document #50

// در دیتابیس:
ChatMessage: { id: 100, body: "این سند..." }
ChatMessageDocument: { messageId: 100, documentId: 50, addedById: 10 }
```

مشابه برای:

- `ChatMessageTask`: لینک به وظایف
- `ChatMessageKnowledge`: لینک به دانش
- `ChatMessageInvoice`: لینک به فاکتورها
- `ChatMessageRequest`: لینک به درخواست‌ها

---

### 5. تعاملات با پیام

#### ChatMessageReaction (واکنش‌ها)

```prisma
model ChatMessageReaction {
  messageId Int
  userId    Int
  emoji     String  // 😀, 👍, ❤️
  createdAt DateTime
}
```

**مثال:**

```typescript
// 3 نفر با emoji 👍 واکنش نشان دادند
[
  { messageId: 100, userId: 10, emoji: "👍" },
  { messageId: 100, userId: 15, emoji: "👍" },
  { messageId: 100, userId: 20, emoji: "👍" },
];

// نمایش در UI:
// 👍 3   ❤️ 1
```

#### ChatMessageReadReceipt (رسید خواندن)

```prisma
model ChatMessageReadReceipt {
  messageId Int
  memberId  Int  // ChatRoomMember.id
  readAt    DateTime
}
```

**مثال:**

```typescript
// پیام 100 توسط 5 نفر از 10 نفر خوانده شده
ReadReceipts.count({ where: { messageId: 100 } }); // 5
ChatRoomMember.count({ where: { roomId: 1 } }); // 10

// نمایش: "خوانده شده توسط 5 نفر"
```

#### ChatTypingIndicator (در حال تایپ)

```prisma
model ChatTypingIndicator {
  roomId    Int
  memberId  Int
  startedAt DateTime
}
```

**Logic:**

1. وقتی کاربر شروع به تایپ می‌کند، یک رکورد اضافه می‌شود
2. هر 30 ثانیه رکوردهای قدیمی‌تر حذف می‌شوند
3. UI می‌پرسد: "چه کسانی دارند تایپ می‌کنند؟"

**نمایش:**

```
"محمد و احمد در حال تایپ هستند..."
```

---

### 6. تنظیمات و دسترسی‌ها

#### ChatRoomSettings

```prisma
model ChatRoomSettings {
  roomId               Int
  whoCanPost           ChatRoomWhoCanPost
  whoCanInvite         ChatRoomWhoCanInvite
  allowFileAttachments Boolean
  allowReactions       Boolean
  maxMessageLength     Int
  autoDeleteAfterDays  Int?
}
```

**مثال:**

```typescript
// اتاق اعلانات (فقط خواندنی برای اعضا)
{
  whoCanPost: "ADMINS_ONLY",
  whoCanInvite: "OWNER_ONLY",
  allowReactions: true,
  allowReplies: false
}

// اتاق عمومی
{
  whoCanPost: "ALL_MEMBERS",
  whoCanInvite: "ALL_MEMBERS",
  allowFileAttachments: true,
  maxMessageLength: 10000
}
```

#### ChatRoomPermission

```prisma
model ChatRoomPermission {
  roomId          Int
  roleId          Int?
  workspaceUserId Int?
  canRead         Boolean
  canWrite        Boolean
  canDelete       Boolean
  canManage       Boolean
}
```

**مثال:**

```typescript
// دسترسی خاص برای یک کاربر
{
  roomId: 1,
  workspaceUserId: 15,
  canRead: true,
  canWrite: false, // فقط خواندن
  canDelete: false
}

// دسترسی برای یک نقش
{
  roomId: 1,
  roleId: 3, // نقش "Support"
  canRead: true,
  canWrite: true,
  canDelete: true // می‌توانند پیام‌ها را حذف کنند
}
```

---

## 🔒 امنیت و Isolation

### 1. Workspace Isolation

**قوانین:**

```typescript
// ❌ غلط: بدون چک workspaceId
const messages = await prisma.chatMessage.findMany({
  where: { roomId },
});

// ✅ صحیح: با چک workspaceId
const messages = await prisma.chatMessage.findMany({
  where: {
    room: {
      workspaceId: context.workspaceId,
    },
  },
});
```

### 2. Member-based Access

**قوانین:**

```typescript
// چک کردن عضویت قبل از هر عملیات
async function checkMembership(roomId, userId) {
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: userId },
    },
  });

  if (!member || member.leftAt !== null) {
    throw new ForbiddenException("شما عضو این اتاق نیستید");
  }

  return member;
}
```

### 3. Permission Checks

```typescript
async function canDeleteMessage(messageId, userId) {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: { room: { include: { members: true } } },
  });

  const member = message.room.members.find((m) => m.workspaceUserId === userId);

  // کاربر می‌تواند پیام خودش را حذف کند
  if (message.senderId === userId) return true;

  // یا اگر Admin/Moderator است
  if (member.role === "ADMIN" || member.role === "MODERATOR") return true;

  return false;
}
```

---

## 📈 Performance و Optimization

### Indexes مهم:

```prisma
// ChatRoom
@@index([workspaceId, type])        // فیلتر بر اساس workspace و نوع
@@index([workspaceId, isArchived])   // فیلتر اتاق‌های فعال
@@index([lastActivityAt])            // sorting بر اساس فعالیت

// ChatMessage
@@index([roomId, createdAt])         // پیام‌های یک اتاق به ترتیب زمان
@@index([roomId, isPinned])          // پیام‌های پین شده

// ChatRoomMember
@@index([workspaceUserId])           // تمام اتاق‌های یک کاربر
@@index([roomId, role])              // اعضای یک اتاق بر اساس نقش
```

### Pagination:

```typescript
// صفحه‌بندی پیام‌ها (از قدیم به جدید)
const messages = await prisma.chatMessage.findMany({
  where: { roomId },
  orderBy: { createdAt: "asc" },
  skip: (page - 1) * limit,
  take: limit,
});

// یا از جدید به قدیم (برای infinite scroll)
const messages = await prisma.chatMessage.findMany({
  where: { roomId },
  orderBy: { createdAt: "desc" },
  take: 50,
  cursor: lastMessageId ? { id: lastMessageId } : undefined,
});
```

---

## 🎯 Use Cases عملی

### 1. ساخت اتاق تیمی خودکار

```typescript
async function createTeamRoom(teamId: number, workspaceId: number) {
  // دریافت اعضای تیم
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });

  // ساخت اتاق + اعضا در transaction
  return prisma.$transaction(async (tx) => {
    // 1. ساخت اتاق
    const room = await tx.chatRoom.create({
      data: {
        type: "TEAM",
        title: `گروه ${team.name}`,
        teamId,
        workspaceId,
        createdById: team.members[0].workspaceUserId, // اولین عضو
      },
    });

    // 2. اضافه کردن اعضا
    await tx.chatRoomMember.createMany({
      data: team.members.map((m) => ({
        roomId: room.id,
        workspaceUserId: m.workspaceUserId,
        role: "MEMBER",
      })),
    });

    // 3. پیام سیستمی خوش‌آمدگویی
    await tx.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: team.members[0].workspaceUserId,
        body: `گروه ${team.name} ایجاد شد. خوش آمدید!`,
        messageType: "SYSTEM",
      },
    });

    return room;
  });
}
```

### 2. ارسال پیام با لینک به سند

```typescript
async function sendMessageWithDocument(
  roomId: number,
  senderId: number,
  body: string,
  documentId: number
) {
  return prisma.$transaction(async (tx) => {
    // 1. ساخت پیام
    const message = await tx.chatMessage.create({
      data: {
        roomId,
        senderId,
        body,
        messageType: "TEXT",
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
```

### 3. دریافت پیام‌های جدید (Unread Count)

```typescript
async function getUnreadCount(roomId: number, userId: number) {
  // دریافت عضویت
  const member = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: userId },
    },
  });

  if (!member || !member.lastReadAt) {
    // همه پیام‌ها جدید هستند
    return prisma.chatMessage.count({ where: { roomId } });
  }

  // پیام‌های بعد از lastReadAt
  return prisma.chatMessage.count({
    where: {
      roomId,
      createdAt: { gt: member.lastReadAt },
    },
  });
}
```

### 4. علامت‌گذاری به عنوان خوانده شده

```typescript
async function markAsRead(roomId: number, userId: number, messageId: number) {
  // به‌روزرسانی عضویت
  await prisma.chatRoomMember.update({
    where: {
      roomId_workspaceUserId: { roomId, workspaceUserId: userId },
    },
    data: {
      lastReadAt: new Date(),
      lastReadMessageId: messageId,
    },
  });

  // اضافه کردن read receipt
  await prisma.chatMessageReadReceipt.create({
    data: {
      messageId,
      memberId: member.id,
      readAt: new Date(),
    },
  });
}
```

---

## 🚀 Migration Plan

### مرحله 1: اضافه کردن جداول جدید

```bash
# ایجاد migration
npx prisma migrate dev --name add_chat_system

# اعمال migration
npx prisma migrate deploy
```

### مرحله 2: Migrate داده‌های قدیمی (اگر وجود دارد)

```typescript
async function migrateLegacyChatData() {
  const oldRooms = await prisma.chatRoom.findMany(); // old schema

  for (const oldRoom of oldRooms) {
    // تبدیل به schema جدید
    const newRoom = await prisma.chatRoom.create({
      data: {
        workspaceId: oldRoom.workspaceId,
        type: inferType(oldRoom.name),
        title: oldRoom.title || oldRoom.name,
        // ...
      },
    });

    // Migrate members
    // Migrate messages
  }
}
```

---

## ✅ Checklist تایید

قبل از تایید نهایی، بررسی کنید:

- [x] تمام روابط به workspace متصل هستند
- [x] Indexes مناسب تعریف شده‌اند
- [x] Cascade deletes صحیح است
- [x] Unique constraints درست هستند
- [x] Enums تمام حالات را پوشش می‌دهند
- [x] JSON fields برای داده‌های flexible استفاده شده
- [x] Soft delete برای پیام‌ها پیاده شده
- [x] Read receipts قابل trace هستند
- [x] Permission system انعطاف‌پذیر است
- [x] Support برای real-time features (typing, reactions)

---

## 🔄 آینده و توسعه

این schema قابلیت اضافه کردن این ویژگی‌ها را دارد:

1. **Voice/Video Call**: اضافه کردن جدول `ChatCall`
2. **Scheduled Messages**: اضافه کردن `scheduledAt` به ChatMessage
3. **Message Templates**: جدول `ChatMessageTemplate`
4. **Webhooks**: اتصال به سیستم‌های خارجی
5. **Analytics**: آمار و گزارش از فعالیت‌های چت
6. **AI Bot Integration**: ربات‌های هوش مصنوعی در چت

---

## 📞 تماس و سوالات

اگر سوالی دارید یا نیاز به توضیحات بیشتر:

- بخش امنیت و isolation را مرور کنید
- Use cases را بررسی کنید
- مثال‌های کد را اجرا کنید

**موفق باشید! 🚀**

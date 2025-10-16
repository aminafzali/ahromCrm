# 📱 راهنمای کامل سیستم چت - دو ماژول جدا

## 📋 فهرست مطالب

1. [معماری کلی](#معماری-کلی)
2. [بخش اول: Internal Chat](#بخش-اول-internal-chat)
3. [بخش دوم: Support Chat](#بخش-دوم-support-chat)
4. [تفاوت‌های کلیدی](#تفاوت‌های-کلیدی)
5. [پیاده‌سازی در داشبورد](#پیاده‌سازی-در-داشبورد)
6. [API Routes](#api-routes)
7. [مثال‌های کاربردی](#مثال‌های-کاربردی)

---

## 🏗️ معماری کلی

سیستم چت شما به **دو ماژول کاملاً جدا** تقسیم شده است:

```
┌─────────────────────────────────────────────────────────┐
│                    ahromCrm System                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────┐   ┌──────────────────────┐   │
│  │  🏢 Internal Chat    │   │  🎫 Support Chat     │   │
│  │  (چت درون سازمانی)   │   │  (چت پشتیبانی)      │   │
│  ├──────────────────────┤   ├──────────────────────┤   │
│  │ ✅ فقط Admin‌ها       │   │ ✅ Admin + مشتریان   │   │
│  │ ✅ WorkspaceUser      │   │ ✅ Guest + User       │   │
│  │ ✅ Team/Project       │   │ ✅ Ticket-based      │   │
│  │ ✅ Real-time         │   │ ✅ SLA & Priority     │   │
│  │ ✅ منابع (Docs...)   │   │ ✅ تخصیص به تیم       │   │
│  └──────────────────────┘   └──────────────────────┘   │
│                                                          │
│  داشبورد Admin:                                         │
│  /dashboard/chat         → Internal Chat                │
│  /dashboard/support      → Support Tickets              │
│                                                          │
│  سایت عمومی:                                            │
│  /[slug]/support         → Support Chat (Guest)         │
│                                                          │
│  پنل کاربری:                                            │
│  /panel                  → (دکمه پشتیبانی)              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🏢 بخش اول: Internal Chat

### 🎯 هدف

گفتگوی **درون سازمانی** بین اعضای تیم، برای هماهنگی در پروژه‌ها و وظایف.

### 👥 کاربران

فقط **WorkspaceUser** با نقش **Admin**.

### 📊 مدل‌های اصلی

#### 1. ChatRoom (اتاق گفتگو)

```prisma
model ChatRoom {
  id          Int      @id @default(autoincrement())
  workspaceId Int

  type        InternalChatRoomType  // DIRECT, TEAM, GROUP, PROJECT
  title       String?
  description String?
  icon        String?

  // ارتباط با موجودیت‌ها
  teamId      Int?
  team        Team?
  projectId   Int?
  project     Project?

  // تنظیمات
  isPrivate   Boolean   @default(false)
  isArchived  Boolean   @default(false)
  isLocked    Boolean   @default(false)

  // روابط
  members     ChatRoomMember[]
  messages    ChatMessage[]

  // لینک به منابع
  linkedDocuments  ChatRoomDocument[]
  linkedTasks      ChatRoomTask[]
  linkedKnowledge  ChatRoomKnowledge[]
}
```

**انواع اتاق:**

- `DIRECT`: گفتگوی خصوصی 1-1
- `TEAM`: اتاق خودکار برای هر تیم
- `GROUP`: گروه دستی
- `PROJECT`: اتاق پروژه

#### 2. ChatRoomMember (اعضای اتاق)

```prisma
model ChatRoomMember {
  roomId          Int
  workspaceUserId Int
  role            ChatRoomMemberRole  // OWNER, ADMIN, MODERATOR, MEMBER, GUEST

  // وضعیت خواندن
  lastReadAt      DateTime?
  lastReadMessageId Int?

  // تنظیمات شخصی
  isMuted         Boolean
  customNickname  String?
  customColor     String?
}
```

#### 3. ChatMessage (پیام)

```prisma
model ChatMessage {
  roomId      Int
  senderId    Int

  body        String
  messageType ChatMessageType  // TEXT, IMAGE, FILE, VOICE, VIDEO, SYSTEM

  // Thread
  replyToId   Int?

  // ضمیمه‌ها
  attachments Json?
  mentions    Json?  // [@userId1, @userId2]

  // ویرایش/حذف
  isEdited    Boolean
  isDeleted   Boolean

  // پین
  isPinned    Boolean
}
```

### 🎨 UI در داشبورد

```
/dashboard/chat
├── Sidebar (لیست اتاق‌ها)
│   ├── Direct Messages
│   ├── Team Rooms
│   ├── Project Rooms
│   └── Groups
│
└── Main Area
    ├── Header
    │   ├── Room Title
    │   └── Tabs: [💬 پیام‌ها] [📄 اسناد] [📚 دانش] [✅ وظایف]
    │
    ├── Messages Area
    │   └── (بسته به تب فعال)
    │
    └── Input
```

### 💻 مثال کد: ساخت اتاق تیمی

```typescript
// services/InternalChatService.ts
async function createTeamRoom(teamId: number, workspaceId: number) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });

  return prisma.$transaction(async (tx) => {
    // 1. ساخت اتاق
    const room = await tx.chatRoom.create({
      data: {
        type: "TEAM",
        title: `تیم ${team.name}`,
        teamId,
        workspaceId,
        createdById: team.members[0].workspaceUserId,
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

    // 3. پیام خوش‌آمدگویی
    await tx.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: team.members[0].workspaceUserId,
        body: `گروه ${team.name} ایجاد شد`,
        messageType: "SYSTEM",
      },
    });

    return room;
  });
}
```

---

## 🎫 بخش دوم: Support Chat

### 🎯 هدف

پشتیبانی از **مشتریان** (ثبت‌نام شده یا مهمان) توسط **تیم پشتیبانی**.

### 👥 کاربران

- **مشتریان**: کاربران مهمان (بدون ثبت‌نام) یا WorkspaceUser با نقش User
- **پشتیبانان**: WorkspaceUser با نقش Admin (عضو تیم Support)

### 📊 مدل‌های اصلی

#### 1. SupportGuestUser (کاربر مهمان)

```prisma
model SupportGuestUser {
  workspaceId Int

  // اطلاعات شبکه
  ipAddress   String    // 192.168.1.1 یا IPv6
  country     String?   // "Iran"
  city        String?   // "Tehran"
  userAgent   String?
  browser     String?   // "Chrome 120"
  os          String?   // "Windows 11"
  device      String?   // "desktop" | "mobile" | "tablet"

  // اطلاعات تماس (اختیاری)
  email       String?
  name        String?
  phone       String?

  // شناسایی
  fingerprint String?   // Browser fingerprint
  sessionId   String?

  // آمار
  firstVisitAt DateTime
  lastVisitAt  DateTime
  visitCount   Int

  // روابط
  tickets     SupportTicket[]
  messages    SupportMessage[]
}
```

**چرا این اطلاعات؟**
✅ شناسایی کاربر در بازدیدهای بعدی  
✅ جلوگیری از spam  
✅ آمار جغرافیایی  
✅ بهبود UX (نمایش پیام به زبان کاربر)

#### 2. SupportTicket (تیکت)

```prisma
model SupportTicket {
  workspaceId Int

  ticketNumber String   // "TKT-2024-00001"

  // کاربر (یکی از دو)
  guestUserId     Int?
  workspaceUserId Int?

  // اطلاعات
  subject     String
  description String?

  // وضعیت
  status      SupportTicketStatus   // OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED
  priority    SupportPriority       // LOW, MEDIUM, HIGH, URGENT, CRITICAL

  // تخصیص
  assignedToId   Int?    // پشتیبان
  assignedTeamId Int?    // تیم پشتیبانی

  // SLA
  firstResponseAt DateTime?
  resolvedAt      DateTime?
  responseTime    Int?      // ثانیه
  resolutionTime  Int?      // ثانیه

  // روابط
  messages    SupportMessage[]
  labels      SupportTicketLabel[]
  history     SupportTicketHistory[]

  // لینک به منابع
  linkedTasks     SupportTicketTask[]
  linkedDocuments SupportTicketDocument[]
  linkedKnowledge SupportTicketKnowledge[]
}
```

#### 3. SupportMessage (پیام تیکت)

```prisma
model SupportMessage {
  ticketId Int

  // فرستنده (یکی از سه)
  supportAgentId  Int?   // پشتیبان
  guestUserId     Int?   // مهمان
  workspaceUserId Int?   // کاربر ثبت‌نام شده

  body        String
  messageType SupportMessageType  // TEXT, IMAGE, FILE, SYSTEM, NOTE

  // دسترسی
  isInternal  Boolean  // ✅ کلیدی: فقط پشتیبان‌ها می‌بینند
  isVisible   Boolean

  // وضعیت
  isRead      Boolean
  readAt      DateTime?
}
```

**پیام‌های داخلی (Internal Notes):**

```typescript
// پشتیبان یادداشت خصوصی می‌نویسد
await prisma.supportMessage.create({
  data: {
    ticketId: 123,
    supportAgentId: 10,
    body: "این مشتری قبلاً هم مشکل مشابه داشته",
    messageType: "NOTE",
    isInternal: true, // ✅ مشتری نمی‌بیند
    isVisible: false,
  },
});
```

### 🎨 UI در داشبورد

#### برای Admin (تیم پشتیبانی):

```
/dashboard/support
├── Sidebar
│   ├── Stats
│   │   ├── Open: 12
│   │   ├── In Progress: 5
│   │   └── Today: 8
│   │
│   ├── Filters
│   │   ├── وضعیت
│   │   ├── اولویت
│   │   ├── تخصیص شده به من
│   │   └── تخصیص نشده
│   │
│   └── Ticket List
│
└── Main Area
    ├── Ticket Header
    │   ├── #TKT-2024-00001
    │   ├── Subject
    │   ├── Status Badge
    │   ├── Priority Badge
    │   └── Actions (تخصیص، بستن، ...)
    │
    ├── Customer Info
    │   ├── نام/ایمیل
    │   ├── IP: 192.168.1.1
    │   ├── کشور: Iran
    │   ├── Browser: Chrome
    │   └── بازدید: 3 بار
    │
    ├── Messages
    │   ├── پیام‌های مشتری (سمت چپ)
    │   ├── پیام‌های پشتیبان (سمت راست)
    │   └── یادداشت‌های داخلی (با پس‌زمینه زرد)
    │
    ├── Linked Resources
    │   ├── وظایف مرتبط
    │   ├── اسناد مرتبط
    │   └── دانش مرتبط
    │
    └── Input
        ├── [💬 پیام عمومی] [📝 یادداشت خصوصی]
        └── [📎 ضمیمه] [🔗 لینک منابع]
```

#### برای مشتری (Guest/User):

```
/[slug]/support  یا  /panel (دکمه پشتیبانی)

┌────────────────────────────────────┐
│  🎫 پشتیبانی آنلاین                │
├────────────────────────────────────┤
│  تیکت: TKT-2024-00001              │
│  وضعیت: در حال بررسی               │
├────────────────────────────────────┤
│  [پیام‌ها]                         │
│                                    │
│  شما: سلام نیاز به کمک دارم        │
│  10:30                             │
│                                    │
│       پشتیبان: سلام، چطور می‌تونم  │
│                         کمک کنم؟   │
│                            10:32   │
│                                    │
│  شما: ...                          │
│                                    │
├────────────────────────────────────┤
│  [_________________] [ارسال]       │
└────────────────────────────────────┘

💡 یادداشت‌های خصوصی پشتیبان نمایش داده نمی‌شود!
```

### 💻 مثال کد: ایجاد تیکت مهمان

```typescript
// app/api/support/tickets/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { workspaceId, subject, guestInfo } = body;

  // استخراج IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // دریافت اطلاعات جغرافیایی (از سرویس یا دیتابیس)
  const geoData = await fetch(`https://ipapi.co/${ip}/json/`)
    .then((r) => r.json())
    .catch(() => ({}));

  // Parse User-Agent
  const userAgent = req.headers.get("user-agent") || "";
  const parsed = parseUserAgent(userAgent);

  return prisma.$transaction(async (tx) => {
    // 1. جستجو یا ساخت کاربر مهمان
    let guestUser = await tx.supportGuestUser.findFirst({
      where: {
        workspaceId,
        ipAddress: ip,
        fingerprint: guestInfo.fingerprint,
      },
    });

    if (!guestUser) {
      guestUser = await tx.supportGuestUser.create({
        data: {
          workspaceId,
          ipAddress: ip,
          country: geoData.country_name,
          city: geoData.city,
          userAgent,
          browser: parsed.browser,
          os: parsed.os,
          device: parsed.device,
          fingerprint: guestInfo.fingerprint,
          sessionId: generateSessionId(),
          visitCount: 1,
        },
      });
    } else {
      // بروزرسانی آمار
      await tx.supportGuestUser.update({
        where: { id: guestUser.id },
        data: {
          lastVisitAt: new Date(),
          visitCount: { increment: 1 },
        },
      });
    }

    // 2. ساخت شماره تیکت
    const ticketNumber = await generateTicketNumber(tx, workspaceId);

    // 3. ایجاد تیکت
    const ticket = await tx.supportTicket.create({
      data: {
        workspaceId,
        ticketNumber,
        subject,
        guestUserId: guestUser.id,
        priority: "MEDIUM",
        status: "OPEN",
      },
      include: {
        guestUser: true,
      },
    });

    // 4. پیام خوش‌آمدگویی
    await tx.supportMessage.create({
      data: {
        ticketId: ticket.id,
        body: `تیکت ${ticketNumber} ایجاد شد. به زودی یک پشتیبان پاسخ خواهد داد.`,
        messageType: "SYSTEM",
        isInternal: false,
      },
    });

    // 5. ثبت تاریخچه
    await tx.supportTicketHistory.create({
      data: {
        ticketId: ticket.id,
        action: "CREATED",
        note: `تیکت توسط مهمان (IP: ${ip}) ایجاد شد`,
      },
    });

    return Response.json({ ticket });
  });
}

// Helper: تولید شماره تیکت
async function generateTicketNumber(
  tx: any,
  workspaceId: number
): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.supportTicket.count({
    where: {
      workspaceId,
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });

  const number = (count + 1).toString().padStart(5, "0");
  return `TKT-${year}-${number}`;
}

// Helper: Parse User-Agent
function parseUserAgent(ua: string) {
  // استفاده از کتابخانه ua-parser-js
  const UAParser = require("ua-parser-js");
  const parser = new UAParser(ua);

  return {
    browser: `${parser.getBrowser().name} ${parser.getBrowser().version}`,
    os: `${parser.getOS().name} ${parser.getOS().version}`,
    device: parser.getDevice().type || "desktop",
  };
}
```

---

## ⚖️ تفاوت‌های کلیدی

| ویژگی             | 🏢 Internal Chat             | 🎫 Support Chat                    |
| ----------------- | ---------------------------- | ---------------------------------- |
| **هدف**           | همکاری درون تیمی             | پشتیبانی مشتری                     |
| **کاربران**       | فقط Admin                    | Admin + Guest + User               |
| **دسترسی**        | محدود به WorkspaceUser       | عمومی (وبسایت)                     |
| **ساختار**        | اتاق محور (Room-based)       | تیکت محور (Ticket-based)           |
| **Real-time**     | بله (Socket.io)              | اختیاری                            |
| **تخصیص**         | خودکار (تیم/پروژه)           | دستی (به پشتیبان)                  |
| **SLA**           | خیر                          | بله (responseTime, resolutionTime) |
| **اولویت**        | خیر                          | بله (LOW → CRITICAL)               |
| **وضعیت**         | فعال/آرشیو                   | OPEN → CLOSED (7 حالت)             |
| **پیام خصوصی**    | خیر                          | بله (isInternal)                   |
| **شناسایی مهمان** | نامربوط                      | بله (IP, Geo, Browser)             |
| **تاریخچه**       | فقط پیام‌ها                  | تاریخچه کامل تغییرات               |
| **لینک منابع**    | بله (Docs, Tasks, Knowledge) | بله (+ تخصیص وظیفه به Dev)         |
| **UI Location**   | `/dashboard/chat`            | `/dashboard/support`               |

---

## 🖥️ پیاده‌سازی در داشبورد

### ساختار فولدرها

```
src/
├── modules/
│   ├── internal-chat/           ✅ ماژول چت درون سازمانی
│   │   ├── api/
│   │   │   ├── route.ts         → GET/POST /api/internal-chat
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── messages/route.ts
│   │   │   └── rooms/[roomId]/resources/route.ts
│   │   ├── components/
│   │   │   ├── ChatRoomList.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── RoomHeader.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ResourceTabs.tsx  (Documents/Tasks/Knowledge)
│   │   ├── hooks/
│   │   │   └── useInternalChat.ts
│   │   ├── service/
│   │   │   └── InternalChatService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── views/
│   │       └── page.tsx         → /dashboard/chat
│   │
│   └── support/                  ✅ ماژول پشتیبانی
│       ├── api/
│       │   ├── tickets/
│       │   │   ├── route.ts     → GET/POST /api/support/tickets
│       │   │   └── [id]/
│       │   │       ├── route.ts
│       │   │       ├── messages/route.ts
│       │   │       ├── assign/route.ts
│       │   │       └── status/route.ts
│       │   ├── categories/route.ts
│       │   └── labels/route.ts
│       ├── components/
│       │   ├── admin/
│       │   │   ├── TicketList.tsx
│       │   │   ├── TicketDetail.tsx
│       │   │   ├── CustomerInfo.tsx
│       │   │   ├── MessageThread.tsx
│       │   │   └── InternalNoteEditor.tsx
│       │   └── public/
│       │       ├── SupportWidget.tsx    (برای وبسایت)
│       │       └── TicketStatus.tsx
│       ├── hooks/
│       │   ├── useSupport.ts
│       │   └── useSupportTicket.ts
│       ├── service/
│       │   └── SupportService.ts
│       ├── types/
│       │   └── index.ts
│       └── views/
│           ├── admin/
│           │   └── page.tsx      → /dashboard/support
│           └── public/
│               └── page.tsx      → /[slug]/support
```

### مسیرهای داشبورد

```typescript
// lib/data.tsx

export const adminMenuItems = [
  // ... existing items

  // بخش ارتباطات
  {
    id: "chat",
    label: "چت تیمی",
    icon: <DIcon icon="fa-comments" />,
    href: "/dashboard/chat",
  },
  {
    id: "support",
    label: "پشتیبانی مشتریان",
    icon: <DIcon icon="fa-headset" />,
    href: "/dashboard/support",
    badge: unreadTicketsCount, // تعداد تیکت‌های خوانده نشده
  },
];
```

---

## 🔌 API Routes

### Internal Chat

```
GET    /api/internal-chat                      → لیست اتاق‌ها
POST   /api/internal-chat                      → ساخت اتاق
GET    /api/internal-chat/[id]                 → جزئیات اتاق
PATCH  /api/internal-chat/[id]                 → ویرایش اتاق
DELETE /api/internal-chat/[id]                 → حذف اتاق

GET    /api/internal-chat/[id]/messages        → لیست پیام‌ها
POST   /api/internal-chat/[id]/messages        → ارسال پیام
PATCH  /api/internal-chat/[id]/messages/[msgId] → ویرایش پیام
DELETE /api/internal-chat/[id]/messages/[msgId] → حذف پیام

GET    /api/internal-chat/[id]/members         → لیست اعضا
POST   /api/internal-chat/[id]/members         → اضافه کردن عضو
DELETE /api/internal-chat/[id]/members/[userId] → حذف عضو

GET    /api/internal-chat/[id]/resources       → منابع اتاق (Docs/Tasks/Knowledge)
POST   /api/internal-chat/[id]/resources/documents → لینک سند
POST   /api/internal-chat/[id]/resources/tasks → لینک وظیفه
POST   /api/internal-chat/[id]/resources/knowledge → لینک دانش
```

### Support Chat

```
GET    /api/support/tickets                    → لیست تیکت‌ها
POST   /api/support/tickets                    → ایجاد تیکت
GET    /api/support/tickets/[id]               → جزئیات تیکت
PATCH  /api/support/tickets/[id]               → ویرایش تیکت
DELETE /api/support/tickets/[id]               → حذف تیکت

GET    /api/support/tickets/[id]/messages      → لیست پیام‌ها
POST   /api/support/tickets/[id]/messages      → ارسال پیام
POST   /api/support/tickets/[id]/messages/internal → ارسال یادداشت خصوصی

POST   /api/support/tickets/[id]/assign        → تخصیص به پشتیبان
PATCH  /api/support/tickets/[id]/status        → تغییر وضعیت
PATCH  /api/support/tickets/[id]/priority      → تغییر اولویت

GET    /api/support/tickets/[id]/history       → تاریخچه تغییرات
GET    /api/support/tickets/[id]/resources     → منابع لینک شده

GET    /api/support/categories                 → دسته‌بندی‌ها
GET    /api/support/labels                     → برچسب‌ها

GET    /api/support/stats                      → آمار (تعداد باز/بسته/...)
```

---

## 💡 مثال‌های کاربردی

### 1. ساخت اتاق پروژه + ارسال پیام + لینک سند

```typescript
async function setupProjectChat(projectId: number) {
  // 1. ساخت اتاق
  const room = await fetch("/api/internal-chat", {
    method: "POST",
    body: JSON.stringify({
      type: "PROJECT",
      projectId,
      title: "پروژه CRM",
      description: "گفتگو درباره پروژه CRM",
    }),
  }).then((r) => r.json());

  // 2. ارسال پیام
  await fetch(`/api/internal-chat/${room.id}/messages`, {
    method: "POST",
    body: JSON.stringify({
      body: "سلام تیم! این اتاق برای هماهنگی پروژه CRM است.",
      messageType: "TEXT",
    }),
  });

  // 3. لینک سند به اتاق
  await fetch(`/api/internal-chat/${room.id}/resources/documents`, {
    method: "POST",
    body: JSON.stringify({
      documentId: 50,
      isPinned: true,
      note: "مستندات اولیه پروژه",
    }),
  });

  return room;
}
```

### 2. پاسخ پشتیبان به تیکت + ارسال یادداشت خصوصی

```typescript
async function respondToTicket(ticketId: number) {
  // 1. پاسخ عمومی (مشتری می‌بیند)
  await fetch(`/api/support/tickets/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      body: "سلام، مشکل شما را بررسی کردم. لطفاً این فایل را دانلود کنید.",
      messageType: "TEXT",
      isInternal: false,
    }),
  });

  // 2. یادداشت خصوصی (فقط پشتیبان‌ها می‌بینند)
  await fetch(`/api/support/tickets/${ticketId}/messages/internal`, {
    method: "POST",
    body: JSON.stringify({
      body: "این مشتری قبلاً هم مشکل مشابه داشته. باید به تیم Dev اطلاع دهیم.",
      messageType: "NOTE",
    }),
  });

  // 3. لینک به وظیفه
  await fetch(`/api/support/tickets/${ticketId}/resources/tasks`, {
    method: "POST",
    body: JSON.stringify({
      taskId: 123, // وظیفه برای تیم Dev
      note: "رفع باگ مربوط به این تیکت",
    }),
  });

  // 4. تغییر وضعیت
  await fetch(`/api/support/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "WAITING", // منتظر پاسخ مشتری
      note: "راهنمایی ارسال شد، منتظر بازخورد مشتری",
    }),
  });
}
```

### 3. دریافت منابع یک اتاق (Documents + Tasks + Knowledge)

```typescript
async function getChatRoomResources(
  roomId: number,
  includeProject: boolean = true
) {
  const response = await fetch(
    `/api/internal-chat/${roomId}/resources?includeProject=${includeProject}`
  );

  const data = await response.json();

  return {
    documents: {
      total: data.documents.length,
      pinned: data.documents.filter((d: any) => d.isPinned),
      items: data.documents,
    },
    tasks: {
      total: data.tasks.length,
      pending: data.tasks.filter((t: any) => t.status.name === "در حال انجام"),
      items: data.tasks,
    },
    knowledge: {
      total: data.knowledge.length,
      items: data.knowledge,
    },
  };
}

// استفاده:
const resources = await getChatRoomResources(123, true);

console.log(`اسناد: ${resources.documents.total}`);
console.log(`وظایف در حال انجام: ${resources.tasks.pending.length}`);
console.log(`مقالات دانش: ${resources.knowledge.total}`);
```

---

## 🎯 نکات کلیدی پیاده‌سازی

### 1. امنیت

```typescript
// همیشه workspaceId را چک کنید
async function checkAccess(
  roomId: number,
  userId: number,
  workspaceId: number
) {
  const room = await prisma.chatRoom.findFirst({
    where: {
      id: roomId,
      workspaceId, // ✅ Workspace Isolation
      members: {
        some: {
          workspaceUserId: userId, // ✅ عضویت
          leftAt: null, // ✅ هنوز عضو است
        },
      },
    },
  });

  if (!room) {
    throw new ForbiddenException("دسترسی غیرمجاز");
  }

  return room;
}
```

### 2. Real-time (Socket.io)

```typescript
// pages/api/socket.ts
import { Server } from "socket.io";

export default function handler(req: any, res: any) {
  if (res.socket.server.io) {
    return res.end();
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // پیوستن به اتاق
    socket.on("join-room", (roomId: number) => {
      socket.join(`room-${roomId}`);
    });

    // ارسال پیام
    socket.on("send-message", async (data) => {
      const { roomId, message } = data;

      // ذخیره در دیتابیس
      const savedMessage = await prisma.chatMessage.create({
        data: message,
      });

      // ارسال real-time به همه اعضای اتاق
      io.to(`room-${roomId}`).emit("new-message", savedMessage);
    });
  });

  return res.end();
}
```

### 3. Pagination

```typescript
// برای پیام‌ها (نمایش از جدید به قدیم)
async function getMessages(
  roomId: number,
  page: number = 1,
  limit: number = 50
) {
  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      sender: {
        select: {
          displayName: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  // معکوس کردن برای نمایش (قدیمی‌ترین در بالا)
  return messages.reverse();
}
```

---

## 📚 منابع اضافی

- [Schema کامل - V2](./chat-schema-proposal-v2.prisma)
- [مقایسه Schema قدیم و جدید](./chat-schema-comparison.md)
- [مثال‌های پیشرفته](./chat-schema-examples.md)

---

**موفق باشید! 🚀**

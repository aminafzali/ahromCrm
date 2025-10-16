# 🔀 مقایسه سه سیستم

## 📊 خلاصه سیستم‌ها

| ویژگی          | 🗂️ Support Info           | 🎫 Support Chat           | 🏢 Internal Chat           |
| -------------- | ------------------------- | ------------------------- | -------------------------- |
| **نام فارسی**  | اطلاعات پشتیبانی          | چت پشتیبانی آنلاین        | چت درون سازمانی            |
| **مدل اصلی**   | `SupportInfo`             | `SupportChatTicket`       | `ChatRoom`                 |
| **کاربران**    | WorkspaceUser             | Guest + WorkspaceUser     | فقط Admin                  |
| **نوع ارتباط** | تلفنی، حضوری، تیکت        | چت آنلاین                 | چت تیمی                    |
| **شناسه**      | شماره ساده                | TKT-2024-00001            | شناسه عددی                 |
| **UI مشتری**   | ❌                        | `/[slug]/support`         | ❌                         |
| **UI Admin**   | `/dashboard/support-info` | `/dashboard/support-chat` | `/dashboard/internal-chat` |

---

## 🗂️ سیستم 1: Support Info (اطلاعات پشتیبانی)

### 🎯 هدف

**ثبت و پیگیری تماس‌های پشتیبانی** (تلفنی، حضوری، تیکت ایمیل، و...)

### 👥 کاربران

- **فقط کاربران داخلی** (`WorkspaceUser` با نقش User یا Admin)
- **بدون دسترسی عمومی**

### 📋 ویژگی‌ها

```typescript
model SupportInfo {
  id              Int
  title           String
  description     String?

  // نوع تماس
  source          SupportSource  // INBOUND_CALL, OUTBOUND_CALL, USER_TICKET, ...
  type            SupportType    // SALES_ORDER, QUOTE, ISSUE, QUESTION, ...
  priority        SupportPriority
  status          String         // NEW, OPEN, IN_PROGRESS, RESOLVED, CLOSED

  // زمان‌بندی
  contactAt       DateTime?      // زمان تماس
  dueAt           DateTime?      // موعد پیگیری

  // تخصیص
  userId          Int?           // کاربر مرتبط (WorkspaceUser)
  assignedAdminId Int?           // ادمین پیگیر
  assignedTeamId  Int?           // تیم پیگیر

  // طبقه‌بندی
  categoryId      Int?
  labels          SupportInfoLabel[]

  // وابستگی‌ها
  tasks           SupportInfoTask[]
  documents       SupportInfoDocument[]
  knowledge       SupportInfoKnowledge[]
}
```

### 🎨 UI

#### برای Admin:

```
/dashboard/support-info

┌─────────────────────────────────────┐
│  📞 اطلاعات پشتیبانی                │
├─────────────────────────────────────┤
│  [+ ثبت تماس جدید]                  │
│                                     │
│  فیلترها:                           │
│  - نوع تماس (تلفنی، حضوری، ...)     │
│  - وضعیت                            │
│  - اولویت                           │
│                                     │
│  جدول تماس‌ها:                      │
│  عنوان | نوع | وضعیت | اولویت | ... │
│  --------------------------------   │
│  ...                                │
└─────────────────────────────────────┘
```

#### فرم ثبت تماس:

```
عنوان: [__________________]
نوع ارتباط: [تماس ورودی ▼]
نوع پشتیبانی: [سفارش فروش ▼]
اولویت: [متوسط ▼]
وضعیت: [جدید ▼]
زمان تماس: [1403/07/23 - 14:30]
کاربر: [انتخاب کاربر ▼]
ادمین پیگیر: [انتخاب ادمین ▼]
توضیحات: [_________________]
```

### 🔄 Workflow

```
1. ادمین تماس تلفنی یا حضوری دریافت می‌کند
   ↓
2. در سیستم ثبت می‌کند (نوع: تماس ورودی)
   ↓
3. وظیفه ایجاد می‌کند (در صورت نیاز)
   ↓
4. به تیم فروش/پشتیبانی تخصیص می‌دهد
   ↓
5. پیگیری می‌کند و وضعیت را به‌روز می‌کند
   ↓
6. در نهایت وضعیت را "حل شده" می‌کند
```

---

## 🎫 سیستم 2: Support Chat (چت پشتیبانی آنلاین)

### 🎯 هدف

**تیکتینگ آنلاین با مشتریان** (از وبسایت، برای مهمان‌ها و کاربران عادی)

### 👥 کاربران

- **مهمان‌ها** (`SupportGuestUser`) - بدون ثبت‌نام
- **کاربران عادی** (`WorkspaceUser` با نقش User)
- **پشتیبانان** (`WorkspaceUser` با نقش Admin)

### 📋 ویژگی‌ها

```typescript
model SupportGuestUser {
  ipAddress    String
  country      String?
  city         String?
  browser      String?
  os           String?
  device       String?
  fingerprint  String?
  email        String?
  name         String?
}

model SupportChatTicket {
  ticketNumber     String          // TKT-2024-00001

  // کاربر (یکی از دو)
  guestUserId      Int?
  workspaceUserId  Int?

  subject          String
  description      String?

  status           SupportTicketStatus  // OPEN, IN_PROGRESS, WAITING, ...
  priority         SupportPriority

  // تخصیص
  assignedToId     Int?
  assignedTeamId   Int?

  // SLA
  firstResponseAt  DateTime?
  resolvedAt       DateTime?
  responseTime     Int?             // ثانیه
  resolutionTime   Int?             // ثانیه

  // روابط
  messages         SupportChatMessage[]
  history          SupportChatHistory[]
  labels           SupportChatLabel[]
}

model SupportChatMessage {
  // فرستنده (یکی از سه)
  supportAgentId   Int?
  guestUserId      Int?
  workspaceUserId  Int?

  body             String
  messageType      MessageType

  isInternal       Boolean          // ⭐ یادداشت خصوصی
  isVisible        Boolean
}
```

### 🎨 UI

#### برای مهمان (وبسایت):

```
/[slug]/support

┌────────────────────────────────────┐
│  🎫 پشتیبانی آنلاین                │
├────────────────────────────────────┤
│  نام: [___________________]        │
│  ایمیل: [___________________]      │
│  موضوع: [___________________]      │
│  پیام: [____________________]      │
│  [ارسال تیکت]                      │
└────────────────────────────────────┘

بعد از ارسال:
┌────────────────────────────────────┐
│  تیکت: TKT-2024-00001              │
│  وضعیت: در حال بررسی               │
├────────────────────────────────────┤
│  پیام‌ها:                          │
│  شما: سلام، نیاز به کمک دارم       │
│                                    │
│       پشتیبان: سلام، چطور می‌تونم  │
│                         کمک کنم؟   │
│                                    │
│  [_________________] [ارسال]       │
└────────────────────────────────────┘
```

#### برای Admin:

```
/dashboard/support-chat

┌─────────────────────────────────────┐
│  🎫 پشتیبانی آنلاین                 │
├─────────────────────────────────────┤
│  Sidebar:                           │
│  - باز: 12                          │
│  - در حال بررسی: 5                 │
│  - امروز: 8                         │
│                                     │
│  Main:                              │
│  #TKT-2024-00001                    │
│  ┌─────────────────────────────┐   │
│  │ 📊 اطلاعات مشتری:            │   │
│  │ IP: 192.168.1.1             │   │
│  │ کشور: Iran                  │   │
│  │ مرورگر: Chrome 120          │   │
│  └─────────────────────────────┘   │
│                                     │
│  پیام‌ها:                           │
│  - پیام‌های عمومی                   │
│  - یادداشت‌های خصوصی (زرد) ⭐       │
│                                     │
│  [💬 پیام عمومی] [📝 یادداشت]      │
└─────────────────────────────────────┘
```

### 🔄 Workflow

```
1. مهمان وارد /[slug]/support می‌شود
   ↓
2. فرم تیکت را پر می‌کند
   ↓
3. سیستم IP، کشور، مرورگر را ذخیره می‌کند
   ↓
4. تیکت با شماره TKT-2024-00001 ایجاد می‌شود
   ↓
5. پشتیبان در /dashboard/support-chat می‌بیند
   ↓
6. تیکت را به خود assign می‌کند
   ↓
7. پاسخ عمومی + یادداشت خصوصی می‌نویسد
   ↓
8. در صورت نیاز، وظیفه برای Dev ایجاد می‌کند
   ↓
9. وضعیت را به "حل شده" تغییر می‌دهد
```

---

## 🏢 سیستم 3: Internal Chat (چت درون سازمانی)

### 🎯 هدف

**گفتگوی real-time بین اعضای تیم** برای هماهنگی پروژه‌ها

### 👥 کاربران

- **فقط Admin** (`WorkspaceUser` با نقش Admin)

### 📋 ویژگی‌ها

```typescript
model ChatRoom {
  type         InternalChatRoomType  // DIRECT, TEAM, GROUP, PROJECT
  title        String?

  // ارتباط با موجودیت‌ها
  teamId       Int?
  projectId    Int?

  // تنظیمات
  isPrivate    Boolean
  isArchived   Boolean

  // روابط
  members      ChatRoomMember[]
  messages     ChatMessage[]

  // لینک به منابع (برای تب‌ها)
  linkedDocuments  ChatRoomDocument[]
  linkedTasks      ChatRoomTask[]
  linkedKnowledge  ChatRoomKnowledge[]
}

model ChatMessage {
  body         String
  messageType  ChatMessageType
  replyToId    Int?
  attachments  Json?
  mentions     Json?

  isPinned     Boolean
  isEdited     Boolean
  isDeleted    Boolean
}
```

### 🎨 UI

```
/dashboard/internal-chat

┌────────────────┬──────────────────────────┐
│  Sidebar       │  Main Area               │
├────────────────┼──────────────────────────┤
│  Direct        │  [💬] [📄] [📚] [✅]      │
│  - علی         │                          │
│  - مریم        │  پیام‌ها:                │
│                │  علی: سلام                │
│  Team Rooms    │  شما: چطوری؟             │
│  - تیم توسعه   │                          │
│  - تیم فروش    │  [____________] [ارسال]  │
│                │                          │
│  Project       │  تب "اسناد":             │
│  - پروژه CRM   │  - سند پروژه.pdf         │
│  - پروژه ERP   │  - نقشه.jpg              │
└────────────────┴──────────────────────────┘
```

### 🔄 Workflow

```
1. تیم ایجاد می‌شود
   ↓
2. اتاق چت تیم خودکار ساخته می‌شود
   ↓
3. همه اعضای تیم به عنوان Member اضافه می‌شوند
   ↓
4. پروژه جدید به تیم اختصاص می‌یابد
   ↓
5. اتاق چت پروژه ساخته می‌شود
   ↓
6. اعضا در تب "پیام‌ها" صحبت می‌کنند
   ↓
7. اسناد و وظایف را در تب‌های مربوطه share می‌کنند
```

---

## 🔍 جدول مقایسه کامل

| ویژگی                     | 🗂️ Support Info | 🎫 Support Chat  | 🏢 Internal Chat           |
| ------------------------- | --------------- | ---------------- | -------------------------- |
| **دسترسی عمومی**          | ❌              | ✅               | ❌                         |
| **مهمان‌ها**              | ❌              | ✅               | ❌                         |
| **WorkspaceUser (User)**  | ✅              | ✅               | ❌                         |
| **WorkspaceUser (Admin)** | ✅              | ✅               | ✅                         |
| **شناسه**                 | عدد ساده        | TKT-2024-00001   | عدد ساده                   |
| **شناسایی مهمان**         | ❌              | ✅ (IP, Browser) | ❌                         |
| **پیام چت**               | ❌              | ✅               | ✅                         |
| **یادداشت خصوصی**         | ❌              | ✅               | ❌                         |
| **Real-time**             | ❌              | اختیاری          | ✅ Socket.io               |
| **SLA**                   | ❌              | ✅               | ❌                         |
| **تاریخچه تغییرات**       | ❌              | ✅               | ❌                         |
| **لینک به منابع**         | ✅              | ✅               | ✅                         |
| **تب‌های UI**             | ❌              | ❌               | ✅ (پیام/اسناد/وظایف/دانش) |
| **ارتباط با پروژه**       | ❌              | ❌               | ✅                         |
| **ارتباط با تیم**         | ✅              | ✅               | ✅                         |

---

## 🎯 تصمیم‌گیری: کدام سیستم؟

### سناریو 1: تماس تلفنی از مشتری

➡️ **Support Info** (ثبت تماس ورودی)

### سناریو 2: مشتری از وبسایت تیکت می‌فرستد

➡️ **Support Chat** (تیکت آنلاین)

### سناریو 3: هماهنگی درباره پروژه بین اعضای تیم

➡️ **Internal Chat** (چت تیمی)

### سناریو 4: ملاقات حضوری با مشتری

➡️ **Support Info** (ثبت تماس حضوری)

### سناریو 5: کاربر ثبت‌نام شده می‌خواهد با پشتیبانی صحبت کند

➡️ **Support Chat** (از پنل کاربری)

### سناریو 6: به اشتراک‌گذاری سند در تیم

➡️ **Internal Chat** (تب اسناد)

---

## 📊 آمار پیشنهادی برای داشبورد

```typescript
// Dashboard Stats

{
  supportInfo: {
    total: 150,
    open: 45,
    resolved: 105,
    thisWeek: 23
  },

  supportChat: {
    total: 89,
    open: 12,
    waiting: 5,
    guests: 34,
    avgResponseTime: "4.5 دقیقه"
  },

  internalChat: {
    totalRooms: 25,
    activeToday: 15,
    messagesThisWeek: 1234,
    unreadMessages: 8
  }
}
```

---

## ✅ خلاصه

### 🗂️ Support Info

- **هدف**: ثبت اطلاعات تماس‌های پشتیبانی
- **کاربران**: فقط داخلی
- **UI**: `/dashboard/support-info`

### 🎫 Support Chat

- **هدف**: تیکتینگ آنلاین با مهمان‌ها
- **کاربران**: عمومی + داخلی
- **UI**: `/dashboard/support-chat` + `/[slug]/support`

### 🏢 Internal Chat

- **هدف**: چت real-time تیمی
- **کاربران**: فقط Admin
- **UI**: `/dashboard/internal-chat`

---

**سه سیستم کامل = یک CRM جامع! 🚀**

# ⚖️ مقایسه کامل دو سیستم چت

## 📊 جدول مقایسه جامع

| ویژگی           | 🏢 Internal Chat | 🎫 Support Chat     |
| --------------- | ---------------- | ------------------- |
| **نام فارسی**   | چت درون سازمانی  | چت پشتیبانی مشتریان |
| **نام انگلیسی** | Internal Chat    | Support Chat        |
| **مدل اصلی**    | `ChatRoom`       | `SupportTicket`     |

---

## 👥 کاربران و دسترسی

### 🏢 Internal Chat

✅ فقط **Admin** (WorkspaceUser با نقش Admin)  
✅ همه اعضای اتاق باید WorkspaceUser باشند  
✅ نیاز به احراز هویت کامل

### 🎫 Support Chat

✅ **Admin** (تیم پشتیبانی)  
✅ **Guest** (کاربران مهمان بدون ثبت‌نام)  
✅ **User** (WorkspaceUser با نقش User)  
✅ دسترسی عمومی از وبسایت

---

## 🎯 هدف و کاربرد

### 🏢 Internal Chat

- همکاری درون تیمی
- هماهنگی پروژه‌ها
- گفتگوی سریع بین اعضا
- به اشتراک‌گذاری اسناد و وظایف

### 🎫 Support Chat

- پشتیبانی از مشتریان
- رفع مشکلات فنی
- پاسخگویی به سوالات
- ثبت و پیگیری درخواست‌ها

---

## 🏗️ ساختار

### 🏢 Internal Chat - Room-based

```
ChatRoom
├── ChatRoomMember (اعضا)
├── ChatMessage (پیام‌ها)
├── ChatRoomDocument (اسناد)
├── ChatRoomTask (وظایف)
└── ChatRoomKnowledge (دانش)
```

### 🎫 Support Chat - Ticket-based

```
SupportTicket
├── SupportGuestUser (اطلاعات مهمان)
├── SupportMessage (پیام‌ها)
├── SupportTicketHistory (تاریخچه)
├── SupportTicketLabel (برچسب‌ها)
├── SupportTicketDocument (اسناد)
├── SupportTicketTask (وظایف)
└── SupportTicketKnowledge (دانش)
```

---

## 🔢 شناسه‌گذاری

### 🏢 Internal Chat

- شناسه عددی ساده: `123`
- عنوان اتاق: "تیم توسعه"، "پروژه CRM"

### 🎫 Support Chat

- شماره تیکت: `TKT-2024-00001`
- قابل خواندن برای مشتری
- یکتا در سال

---

## 📍 وضعیت‌ها (Status)

### 🏢 Internal Chat

- فعال (Active)
- آرشیو شده (Archived)
- قفل شده (Locked)

### 🎫 Support Chat

```typescript
enum SupportTicketStatus {
  OPEN          // باز
  IN_PROGRESS   // در حال بررسی
  WAITING       // منتظر پاسخ مشتری
  ON_HOLD       // معلق
  RESOLVED      // حل شده
  CLOSED        // بسته شده
  REOPENED      // بازگشایی شده
}
```

---

## 🎚️ اولویت (Priority)

### 🏢 Internal Chat

❌ ندارد

### 🎫 Support Chat

```typescript
enum SupportPriority {
  LOW        // کم
  MEDIUM     // متوسط
  HIGH       // بالا
  URGENT     // فوری
  CRITICAL   // بحرانی
}
```

---

## 👤 شناسایی کاربر

### 🏢 Internal Chat

```typescript
ChatRoomMember {
  workspaceUserId: number  // فقط این
}
```

### 🎫 Support Chat

```typescript
SupportGuestUser {
  ipAddress: string         // 192.168.1.1
  country: string           // "Iran"
  city: string              // "Tehran"
  userAgent: string
  browser: string           // "Chrome 120"
  os: string                // "Windows 11"
  device: string            // "desktop" | "mobile"
  fingerprint: string       // شناسه مرورگر
  sessionId: string
  email?: string
  name?: string
  phone?: string
}
```

---

## 💬 انواع پیام

### 🏢 Internal Chat

```typescript
enum ChatMessageType {
  TEXT
  IMAGE
  FILE
  VOICE
  VIDEO
  LINK
  SYSTEM       // پیام سیستمی
  POLL         // نظرسنجی
  TASK_CREATE  // ایجاد وظیفه
  DOC_SHARE    // اشتراک سند
}
```

### 🎫 Support Chat

```typescript
enum SupportMessageType {
  TEXT
  IMAGE
  FILE
  SYSTEM      // پیام سیستمی
  NOTE        // یادداشت خصوصی ⭐
}
```

---

## 🔒 پیام‌های خصوصی

### 🏢 Internal Chat

❌ همه پیام‌ها عمومی (برای اعضای اتاق)

### 🎫 Support Chat

✅ `isInternal: boolean` و `isVisible: boolean`

```typescript
// پیام عمومی (مشتری می‌بیند)
{
  body: "سلام، چطور می‌تونم کمک کنم؟",
  isInternal: false,
  isVisible: true
}

// یادداشت خصوصی (فقط پشتیبان‌ها می‌بینند) ⭐
{
  body: "این مشتری قبلاً هم مشکل مشابه داشته",
  isInternal: true,
  isVisible: false
}
```

---

## 📊 SLA و آمار

### 🏢 Internal Chat

❌ ندارد

### 🎫 Support Chat

✅ `responseTime: number` (ثانیه)  
✅ `resolutionTime: number` (ثانیه)  
✅ `firstResponseAt: DateTime`  
✅ `resolvedAt: DateTime`  
✅ `reopenCount: number`

---

## 👨‍💼 تخصیص (Assignment)

### 🏢 Internal Chat

- خودکار (اعضای تیم/پروژه)
- دستی (دعوت کردن)

### 🎫 Support Chat

```typescript
SupportTicket {
  assignedToId: number       // پشتیبان
  assignedTeamId: number     // تیم پشتیبانی
}

// تاریخچه تخصیص
SupportTicketHistory {
  action: "ASSIGNED" | "REASSIGNED"
  oldValue: "پشتیبان قبلی"
  newValue: "پشتیبان جدید"
}
```

---

## 🏷️ برچسب‌گذاری (Labels)

### 🏢 Internal Chat

❌ ندارد

### 🎫 Support Chat

✅ `SupportTicketLabel[]`

```typescript
SupportTicketLabel {
  name: "باگ"
  color: "#FF0000"
}
```

---

## 📜 تاریخچه (History)

### 🏢 Internal Chat

❌ فقط پیام‌ها ذخیره می‌شوند

### 🎫 Support Chat

✅ تاریخچه کامل همه تغییرات

```typescript
SupportTicketHistory {
  action: SupportHistoryAction
  fieldName: string
  oldValue: string
  newValue: string
  changedBy: WorkspaceUser
  createdAt: DateTime
}

enum SupportHistoryAction {
  CREATED
  STATUS_CHANGED
  PRIORITY_CHANGED
  ASSIGNED
  REASSIGNED
  CATEGORY_CHANGED
  LABEL_ADDED
  LABEL_REMOVED
  REOPENED
  CLOSED
  RESOLVED
  MESSAGE_SENT
  NOTE_ADDED
}
```

---

## 🔗 لینک به منابع

### 🏢 Internal Chat

**سطح 1: لینک پیام**

- `ChatMessageDocument` (سند در پیام خاص)
- `ChatMessageTask` (وظیفه در پیام خاص)
- `ChatMessageKnowledge` (دانش در پیام خاص)

**سطح 2: لینک اتاق** (برای تب‌های UI)

- `ChatRoomDocument` (اسناد اتاق)
- `ChatRoomTask` (وظایف اتاق)
- `ChatRoomKnowledge` (دانش اتاق)

### 🎫 Support Chat

**فقط سطح تیکت:**

- `SupportTicketDocument`
- `SupportTicketTask`
- `SupportTicketKnowledge`

---

## 🎨 UI Location

### 🏢 Internal Chat

```
/dashboard/chat              → صفحه اصلی
/dashboard/internal-chat     → نام جایگزین

📍 فقط در داشبورد Admin
```

### 🎫 Support Chat

```
/dashboard/support                  → برای Admin (تیم پشتیبانی)
/[slug]/support                     → برای مهمان‌ها (وبسایت)
/panel (دکمه پشتیبانی)              → برای User

📍 در سه مکان مختلف!
```

---

## 🌐 Real-time

### 🏢 Internal Chat

✅ **بله** - Socket.io برای پیام‌های آنی

```typescript
socket.emit('send-message', { roomId, message });
socket.on('new-message', (message) => { ... });
```

### 🎫 Support Chat

🟡 **اختیاری** - می‌تواند با polling کار کند

- برای مشتریان: polling (هر 5 ثانیه)
- برای پشتیبانان: Socket.io (برای dashboard)

---

## 🗄️ حجم داده

### 🏢 Internal Chat

- تعداد کم اتاق (تیم‌ها + پروژه‌ها)
- حجم زیاد پیام (روزانه)
- نگه‌داری همیشگی

### 🎫 Support Chat

- تعداد زیاد تیکت (روزانه/ماهانه)
- پیام‌های متوسط در هر تیکت
- آرشیو بعد از بسته شدن (3-6 ماه)

---

## 🔐 امنیت

### 🏢 Internal Chat

**چک‌های امنیتی:**

```typescript
// 1. Workspace Isolation
room.workspaceId === context.workspaceId;

// 2. عضویت
ChatRoomMember.findFirst({
  roomId,
  workspaceUserId,
  leftAt: null,
});

// 3. نقش
if (action === "delete" && member.role !== "ADMIN") {
  throw Forbidden;
}
```

### 🎫 Support Chat

**چک‌های امنیتی:**

```typescript
// 1. Workspace Isolation
ticket.workspaceId === context.workspaceId;

// 2. دسترسی
if (context.isGuest) {
  // فقط تیکت‌های خودش
  ticket.guestUserId === guestId || ticket.sessionId === sessionId;
}

if (context.isUser) {
  // فقط تیکت‌های خودش
  ticket.workspaceUserId === workspaceUserId;
}

if (context.isAdmin) {
  // همه تیکت‌های workspace
  ticket.workspaceId === workspaceId;
}

// 3. پیام‌های خصوصی
if (message.isInternal && !context.isAdmin) {
  throw Forbidden;
}
```

---

## 📱 نمونه Workflow

### 🏢 Internal Chat

```
1. تیم ایجاد می‌شود
   ↓
2. اتاق چت تیم خودکار ساخته می‌شود
   ↓
3. همه اعضای تیم به عنوان Member اضافه می‌شوند
   ↓
4. پروژه جدید به تیم اختصاص می‌یابد
   ↓
5. اتاق چت پروژه ساخته می‌شود (لینک به تیم)
   ↓
6. اعضا اسناد و وظایف را share می‌کنند
   ↓
7. در تب "اسناد" همه اسناد پروژه نمایش داده می‌شود
```

### 🎫 Support Chat

```
1. مهمان وارد وبسایت می‌شود (/[slug]/support)
   ↓
2. فرم تیکت را پر می‌کند (موضوع + توضیحات)
   ↓
3. سیستم IP، کشور، مرورگر را ذخیره می‌کند
   ↓
4. تیکت با شماره TKT-2024-00001 ایجاد می‌شود
   ↓
5. تیکت در /dashboard/support برای پشتیبانان نمایش داده می‌شود
   ↓
6. پشتیبان تیکت را به خود assign می‌کند
   ↓
7. پاسخ عمومی + یادداشت خصوصی می‌نویسد
   ↓
8. در صورت نیاز، وظیفه برای تیم Dev ایجاد می‌کند
   ↓
9. وضعیت را به "WAITING" (منتظر مشتری) تغییر می‌دهد
   ↓
10. مشتری پاسخ می‌دهد → وضعیت به "IN_PROGRESS"
   ↓
11. پشتیبان مشکل را حل می‌کند → "RESOLVED"
   ↓
12. بعد از 72 ساعت خودکار → "CLOSED"
```

---

## 🧪 مثال‌های کد

### 🏢 Internal Chat: ارسال پیام با mention

```typescript
await prisma.chatMessage.create({
  data: {
    roomId: 123,
    senderId: currentUserId,
    body: "@علی لطفاً این سند را بررسی کن",
    mentions: [aliUserId], // Array of user IDs
    linkedDocuments: {
      create: [{ documentId: 50, addedById: currentUserId }],
    },
  },
});

// Real-time notification
socket.to(`user-${aliUserId}`).emit("mentioned", {
  roomId: 123,
  messageId: newMessage.id,
  by: currentUserName,
});
```

### 🎫 Support Chat: پاسخ با یادداشت خصوصی

```typescript
// پاسخ عمومی
await prisma.supportMessage.create({
  data: {
    ticketId: 456,
    supportAgentId: agentId,
    body: "سلام، لطفاً فایل لاگ را ارسال کنید",
    isInternal: false,
    isVisible: true,
  },
});

// یادداشت خصوصی (مشتری نمی‌بیند!)
await prisma.supportMessage.create({
  data: {
    ticketId: 456,
    supportAgentId: agentId,
    body: "این باگ قبلاً در تیکت #TKT-2024-00035 هم گزارش شده",
    messageType: "NOTE",
    isInternal: true,
    isVisible: false,
  },
});

// تاریخچه
await prisma.supportTicketHistory.create({
  data: {
    ticketId: 456,
    action: "MESSAGE_SENT",
    changedById: agentId,
    note: "پاسخ اولیه ارسال شد",
  },
});
```

---

## 🎯 خلاصه تصمیم‌گیری

### کدام سیستم را انتخاب کنم؟

| نیاز شما                | سیستم مناسب      |
| ----------------------- | ---------------- |
| چت بین اعضای تیم        | 🏢 Internal Chat |
| گفتگو درباره پروژه      | 🏢 Internal Chat |
| پشتیبانی مشتریان        | 🎫 Support Chat  |
| ثبت تیکت از وبسایت      | 🎫 Support Chat  |
| نیاز به SLA             | 🎫 Support Chat  |
| شناسایی مهمان           | 🎫 Support Chat  |
| یادداشت خصوصی           | 🎫 Support Chat  |
| real-time collaboration | 🏢 Internal Chat |
| تخصیص به تیم پشتیبانی   | 🎫 Support Chat  |

---

## ✅ نتیجه‌گیری

این دو سیستم **کاملاً جدا** هستند و هر کدام هدف خاص خود را دارند:

### 🏢 Internal Chat

➡️ برای **همکاری درون سازمانی**  
➡️ **Admin to Admin**  
➡️ **Real-time & Fast**

### 🎫 Support Chat

➡️ برای **پشتیبانی مشتریان**  
➡️ **Admin to Customer**  
➡️ **Organized & Trackable**

---

**هر دو سیستم در کنار هم = یک CRM کامل! 🚀**

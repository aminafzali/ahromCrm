# 🔄 راهنمای تغییر نام ماژول Support به Support-Info

## 📋 خلاصه تغییرات

### ✅ هدف

تبدیل ماژول `supports` به `support-info` و آزادسازی نام برای سیستم Support Chat جدید.

---

## 🗂️ ساختار نهایی

```
src/modules/
├── support-info/              ✅ (قبلاً: supports)
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── repo/
│   ├── service/
│   ├── types/
│   └── views/
│
├── support-info-categories/   ✅ (قبلاً: supports-categories)
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── repo/
│   ├── service/
│   ├── types/
│   └── views/
│
├── support-chat/              🆕 (سیستم جدید)
│   ├── api/
│   │   ├── tickets/
│   │   └── messages/
│   ├── components/
│   │   ├── admin/
│   │   └── public/
│   ├── hooks/
│   ├── service/
│   ├── types/
│   └── views/
│
└── internal-chat/             🆕 (سیستم جدید)
```

---

## 📝 گام‌های اجرا

### گام 1: تغییر نام در Prisma Schema

```prisma
// prisma/schema.prisma

// ========================================
// بخش 1: Support Info (ماژول قدیمی)
// ========================================

model SupportInfoCategory {
  id          Int                    @id @default(autoincrement())
  workspaceId Int
  workspace   Workspace              @relation("SupportInfoCategoryWorkspace", fields: [workspaceId], references: [id], onDelete: Cascade)
  name        String
  description String?
  parentId    Int?
  parent      SupportInfoCategory?   @relation("SupportInfoCategoryTree", fields: [parentId], references: [id])
  children    SupportInfoCategory[]  @relation("SupportInfoCategoryTree")
  tickets     SupportInfo[]
  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt
}

model SupportInfoLabel {
  id          Int             @id @default(autoincrement())
  workspaceId Int
  workspace   Workspace       @relation("SupportInfoLabelWorkspace", fields: [workspaceId], references: [id], onDelete: Cascade)
  name        String
  color       String?
  tickets     SupportInfo[]   @relation("SupportInfoLabels")
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@unique([name, workspaceId])
}

model SupportInfo {
  id            Int             @id @default(autoincrement())
  workspaceId   Int
  workspace     Workspace       @relation("SupportInfoWorkspace", fields: [workspaceId], references: [id], onDelete: Cascade)
  title         String
  description   String?         @db.LongText
  source        SupportSource
  type          SupportType
  priority      SupportPriority @default(MEDIUM)
  status        String
  contactAt     DateTime?
  dueAt         DateTime?
  visibleToUser Boolean         @default(true)

  userId          Int?
  user            WorkspaceUser? @relation("SupportInfo_user", fields: [userId], references: [id], onDelete: SetNull)
  assignedAdminId Int?
  assignedAdmin   WorkspaceUser? @relation("SupportInfo_assignedAdmin", fields: [assignedAdminId], references: [id], onDelete: SetNull)
  assignedTeamId  Int?
  assignedTeam    Team?          @relation("SupportInfo_assignedTeam", fields: [assignedTeamId], references: [id], onDelete: SetNull)

  categoryId Int?
  category   SupportInfoCategory? @relation(fields: [categoryId], references: [id])

  labels SupportInfoLabel[] @relation("SupportInfoLabels")

  tasks     SupportInfoTask[]
  documents SupportInfoDocument[]
  knowledge SupportInfoKnowledge[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SupportInfoTask {
  id        Int          @id @default(autoincrement())
  ticketId  Int
  ticket    SupportInfo  @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  taskId    Int
  task      Task         @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@unique([ticketId, taskId])
  @@index([ticketId])
  @@index([taskId])
}

model SupportInfoDocument {
  id         Int          @id @default(autoincrement())
  ticketId   Int
  ticket     SupportInfo  @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  documentId Int
  document   Document     @relation(fields: [documentId], references: [id], onDelete: Cascade)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  @@unique([ticketId, documentId])
  @@index([ticketId])
  @@index([documentId])
}

model SupportInfoKnowledge {
  id          Int          @id @default(autoincrement())
  ticketId    Int
  ticket      SupportInfo  @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  knowledgeId Int
  knowledge   Knowledge    @relation(fields: [knowledgeId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([ticketId, knowledgeId])
  @@index([ticketId])
  @@index([knowledgeId])
}

// ========================================
// بخش 2: Support Chat (سیستم جدید)
// ========================================
// این بخش را از chat-schema-proposal-v2.prisma اضافه کنید
```

### گام 2: Migration دیتابیس

```bash
# این migration تغییر نام جداول را ایجاد می‌کند
npx prisma migrate dev --name rename_support_to_support_info
```

**⚠️ نکته مهم**: Prisma ممکن است بخواهد جداول را drop کند. باید migration را دستی ویرایش کنید:

```sql
-- در فایل migration ایجاد شده:

-- تغییر نام جداول (بدون از دست دادن داده)
ALTER TABLE "SupportCategory" RENAME TO "SupportInfoCategory";
ALTER TABLE "SupportTicketLabel" RENAME TO "SupportInfoLabel";
ALTER TABLE "SupportTicket" RENAME TO "SupportInfo";
ALTER TABLE "SupportTicketTask" RENAME TO "SupportInfoTask";
ALTER TABLE "SupportTicketDocument" RENAME TO "SupportInfoDocument";
ALTER TABLE "SupportTicketKnowledge" RENAME TO "SupportInfoKnowledge";

-- تغییر نام constraints و indexes
-- (Prisma این کار را خودکار انجام می‌دهد)
```

### گام 3: تغییر نام فولدرها

```bash
# در ترمینال
mv src/modules/supports src/modules/support-info
mv src/modules/supports-categories src/modules/support-info-categories

# اگر API routes در app/api هستند:
mv src/app/api/supports src/app/api/support-info
```

### گام 4: جستجو و جایگزینی در کد

**جستجوها (در VSCode):**

1. **جستجو**: `SupportsServiceApi` → **جایگزین**: `SupportInfoServiceApi`
2. **جستجو**: `SupportsRepository` → **جایگزین**: `SupportInfoRepository`
3. **جستجو**: `useSupports` → **جایگزین**: `useSupportInfo`
4. **جستجو**: `SupportTicket` → **جایگزین**: `SupportInfo`
5. **جستجو**: `SupportCategory` → **جایگزین**: `SupportInfoCategory`
6. **جستجو**: `supports-categories` → **جایگزین**: `support-info-categories`
7. **جستجو**: `/dashboard/supports` → **جایگزین**: `/dashboard/support-info`
8. **جستجو**: `modules/supports` → **جایگزین**: `modules/support-info`
9. **جستجو**: `@/modules/supports` → **جایگزین**: `@/modules/support-info`

### گام 5: به‌روزرسانی Routes

```typescript
// lib/data.tsx - منوی داشبورد

export const adminMenuItems = [
  // ...
  {
    id: "support-info",
    label: "اطلاعات پشتیبانی",
    icon: <DIcon icon="fa-info-circle" />,
    href: "/dashboard/support-info",
  },
  {
    id: "support-chat", // 🆕 جدید
    label: "چت پشتیبانی آنلاین",
    icon: <DIcon icon="fa-headset" />,
    href: "/dashboard/support-chat",
  },
  {
    id: "internal-chat", // 🆕 جدید
    label: "چت تیمی",
    icon: <DIcon icon="fa-comments" />,
    href: "/dashboard/internal-chat",
  },
];
```

### گام 6: به‌روزرسانی Import ها

```typescript
// قبل:
import { useSupports } from "@/modules/supports/hooks/useSupports";
import { SupportTicketWithRelations } from "@/modules/supports/types";

// بعد:
import { useSupportInfo } from "@/modules/support-info/hooks/useSupportInfo";
import { SupportInfoWithRelations } from "@/modules/support-info/types";
```

---

## 🔍 چک‌لیست تغییرات

### Prisma Schema

- [ ] `SupportCategory` → `SupportInfoCategory`
- [ ] `SupportTicketLabel` → `SupportInfoLabel`
- [ ] `SupportTicket` → `SupportInfo`
- [ ] `SupportTicketTask` → `SupportInfoTask`
- [ ] `SupportTicketDocument` → `SupportInfoDocument`
- [ ] `SupportTicketKnowledge` → `SupportInfoKnowledge`

### Workspace Model Relations

```prisma
model Workspace {
  // ...existing

  // Support Info (قدیمی)
  supportInfoCategories SupportInfoCategory[] @relation("SupportInfoCategoryWorkspace")
  supportInfoLabels     SupportInfoLabel[]    @relation("SupportInfoLabelWorkspace")
  supportInfoTickets    SupportInfo[]         @relation("SupportInfoWorkspace")

  // Support Chat (جدید)
  supportChatGuestUsers SupportGuestUser[]
  supportChatTickets    SupportChatTicket[]
  supportChatCategories SupportChatCategory[]
}

model WorkspaceUser {
  // ...existing

  // Support Info (قدیمی)
  supportInfoAsUser        SupportInfo[] @relation("SupportInfo_user")
  supportInfoAsAssignee    SupportInfo[] @relation("SupportInfo_assignedAdmin")

  // Support Chat (جدید)
  supportChatTicketsAsUser     SupportChatTicket[] @relation("SupportChatTicket_user")
  supportChatTicketsAsAssignee SupportChatTicket[] @relation("SupportChatTicket_assignee")
  supportChatAgentMessages     SupportChatMessage[] @relation("SupportChatAgent_messages")
}

model Team {
  // ...existing

  // Support Info (قدیمی)
  supportInfoTickets SupportInfo[] @relation("SupportInfo_assignedTeam")

  // Support Chat (جدید)
  supportChatTickets SupportChatTicket[] @relation("SupportChatTicket_assignedTeam")
}
```

### Enums

```prisma
// این enums تغییر نمی‌کنند (مشترک هستند)
enum SupportSource {
  INBOUND_CALL
  OUTBOUND_CALL
  USER_TICKET
  ADMIN_TICKET
  ONSITE_BY_USER
  ONSITE_BY_US
}

enum SupportType {
  SALES_ORDER
  QUOTE
  ORDER_FOLLOWUP
  PURCHASE_ORDER
  PURCHASE_QUOTE
  COMPLAINT
  ISSUE
  QUESTION
}

enum SupportPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### فایل‌ها و فولدرها

- [ ] `src/modules/supports/` → `src/modules/support-info/`
- [ ] `src/modules/supports-categories/` → `src/modules/support-info-categories/`
- [ ] تمام import ها به‌روز شوند
- [ ] API routes به‌روز شوند
- [ ] منوی داشبورد به‌روز شود

---

## 📊 تفاوت دو سیستم

### 🗂️ Support Info (ماژول قدیمی - تغییر نام یافته)

**هدف**: ثبت اطلاعات تماس‌های پشتیبانی (تلفنی، حضوری، ایمیل، و...)

**ویژگی‌ها**:

- ✅ ثبت تماس‌های ورودی/خروجی
- ✅ ثبت تماس‌های حضوری
- ✅ لینک به کاربران داخلی (`WorkspaceUser`)
- ✅ اولویت‌بندی
- ✅ تخصیص به ادمین/تیم
- ✅ وضعیت‌های ساده (NEW, OPEN, IN_PROGRESS, RESOLVED, CLOSED)

**UI**:

- `/dashboard/support-info` → لیست تماس‌های پشتیبانی
- فرم ثبت تماس با فیلدهای موجود

---

### 🎫 Support Chat (سیستم جدید)

**هدف**: تیکتینگ آنلاین با مشتریان (مهمان یا ثبت‌نام شده)

**ویژگی‌ها**:

- ✅ ثبت تیکت از وبسایت توسط مهمان‌ها
- ✅ شناسایی کاربر مهمان (IP, Browser, کشور)
- ✅ شماره تیکت یکتا (TKT-2024-00001)
- ✅ پیام‌های چت (عمومی + خصوصی)
- ✅ یادداشت‌های داخلی (فقط پشتیبان‌ها می‌بینند)
- ✅ تاریخچه کامل تغییرات
- ✅ SLA (زمان پاسخ، زمان حل مشکل)
- ✅ برچسب‌ها و دسته‌بندی

**UI**:

- `/dashboard/support-chat` → پنل پشتیبانی آنلاین
- `/[slug]/support` → ویجت تیکت برای مشتریان
- `/panel` → دکمه پشتیبانی برای کاربران

---

## 🚀 اجرای Migration با حفظ داده

```bash
# 1. ویرایش schema.prisma
# (تغییر نام‌ها را اعمال کنید)

# 2. ایجاد migration (بدون اجرا)
npx prisma migrate dev --create-only --name rename_support_to_support_info

# 3. ویرایش فایل migration ایجاد شده
# در migrations/[timestamp]_rename_support_to_support_info/migration.sql:

-- این migration تمام جداول را بدون از دست دادن داده تغییر نام می‌دهد

-- Step 1: Rename tables
ALTER TABLE "SupportCategory" RENAME TO "SupportInfoCategory";
ALTER TABLE "SupportTicketLabel" RENAME TO "SupportInfoLabel";
ALTER TABLE "SupportTicket" RENAME TO "SupportInfo";
ALTER TABLE "SupportTicketTask" RENAME TO "SupportInfoTask";
ALTER TABLE "SupportTicketDocument" RENAME TO "SupportInfoDocument";
ALTER TABLE "SupportTicketKnowledge" RENAME TO "SupportInfoKnowledge";

-- Step 2: Rename columns (foreign keys)
-- Prisma این کار را خودکار انجام می‌دهد

# 4. اجرای migration
npx prisma migrate deploy

# 5. تولید Prisma Client جدید
npx prisma generate
```

---

## ✅ خلاصه

**قبل:**

- `modules/supports` → اطلاعات تماس‌های پشتیبانی

**بعد:**

- `modules/support-info` → اطلاعات تماس‌های پشتیبانی (همان کارکرد)
- `modules/support-chat` → 🆕 تیکتینگ آنلاین با مهمان‌ها
- `modules/internal-chat` → 🆕 چت تیمی درون سازمانی

---

**موفق باشید! 🎯**

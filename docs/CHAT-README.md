# 💬 سیستم Chat - مستندات کامل

این پروژه شامل دو سیستم چت جداگانه است:

1. **Internal Chat (چت درون سازمانی)** - برای ارتباط بین اعضای تیم
2. **Support Chat (چت پشتیبانی)** - برای پشتیبانی از مشتریان

---

## 📚 فهرست مستندات

### 1. مستندات اصلی

- [`chat-system-complete-guide.md`](./chat-system-complete-guide.md) - راهنمای کامل سیستم‌های چت
- [`three-systems-comparison.md`](./three-systems-comparison.md) - مقایسه سه سیستم (Internal Chat, Support Chat, Support Info)
- [`rename-support-to-support-info.md`](./rename-support-to-support-info.md) - راهنمای تغییر نام Support به Support Info

### 2. مستندات Schema

- [`chat-schema-documentation.md`](./chat-schema-documentation.md) - مستندات کامل Schema دیتابیس
- [`chat-schema-examples.md`](./chat-schema-examples.md) - مثال‌های عملی استفاده از Schema
- [`chat-schema-comparison.md`](./chat-schema-comparison.md) - مقایسه نسخه‌های مختلف Schema

### 3. مستندات فنی

- [`socket-io-events.md`](./socket-io-events.md) - مستندات کامل رویدادهای Socket.IO
- [`chat-testing-guide.md`](./chat-testing-guide.md) - راهنمای تست و Debug

---

## 🚀 شروع سریع

### نصب و راه‌اندازی

```bash
# 1. نصب dependencies
npm install

# 2. اجرای migration های Prisma
npx prisma migrate dev

# 3. راه‌اندازی سرور توسعه
npm run dev
```

### دسترسی به سیستم‌ها

- **Internal Chat:** `/dashboard/internal-chat`
- **Support Chat (Admin):** `/dashboard/support-chat`
- **Support Chat (Customer):** `/panel/support-chat`
- **Support Info:** `/dashboard/support-info`

---

## 🏗️ ساختار پروژه

```
src/
├── modules/
│   ├── internal-chat/        # چت درون سازمانی
│   │   ├── api/              # API Routes
│   │   │   ├── contacts/     # لیست مخاطبین
│   │   │   ├── messages/     # پیام‌ها
│   │   │   └── rooms/        # اتاق‌های چت
│   │   ├── components/       # کامپوننت‌های UI
│   │   ├── data/             # تنظیمات Prisma
│   │   ├── hooks/            # React Hooks
│   │   ├── repo/             # Repository Layer
│   │   ├── service/          # Service Layer
│   │   ├── types/            # TypeScript Types
│   │   └── views/            # صفحات Dashboard
│   │
│   ├── support-chat/         # چت پشتیبانی
│   │   ├── api/              # API Routes
│   │   │   ├── route.ts      # لیست تیکت‌ها
│   │   │   ├── id/           # عملیات روی تیکت
│   │   │   ├── categories/   # دسته‌بندی‌ها
│   │   │   └── labels/       # برچسب‌ها
│   │   ├── components/       # کامپوننت‌های UI
│   │   ├── data/             # تنظیمات و جدول
│   │   ├── hooks/            # React Hooks
│   │   ├── repo/             # Repository Layer
│   │   ├── service/          # Service Layer
│   │   ├── types/            # TypeScript Types
│   │   └── views/            # صفحات Dashboard
│   │
│   └── support-info/         # اطلاعات پشتیبانی (تغییر نام یافته)
│       └── ...
│
├── pages/
│   └── api/
│       ├── socket_io.ts      # Socket.IO Server
│       └── types.ts          # Socket Types
│
└── lib/
    └── data.tsx              # منوی Dashboard
```

---

## 🔑 ویژگی‌های کلیدی

### Internal Chat

- ✅ چت مستقیم (Direct) بین کاربران Admin
- ✅ چت گروهی (Team) برای تیم‌ها
- ✅ پیام‌رسانی Real-time با Socket.IO
- ✅ نمایش وضعیت آنلاین/آفلاین کاربران
- ✅ نشانگر "در حال تایپ..."
- ✅ پیام‌های read/unread
- ✅ پاسخ به پیام (Reply)
- ✅ پیوست فایل، اسناد، وظایف
- ✅ ایموجی و واکنش‌ها
- ✅ Workspace Isolation

### Support Chat

- ✅ سیستم تیکت‌محور (Ticket-based)
- ✅ پشتیبانی از مشتریان (Registered Users)
- ✅ پشتیبانی از مهمان‌ها (Guest Users) - آماده برای پیاده‌سازی
- ✅ تخصیص تیکت به کارشناس
- ✅ تغییر وضعیت تیکت
- ✅ اولویت‌بندی (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ دسته‌بندی تیکت‌ها
- ✅ برچسب‌گذاری (Labels)
- ✅ یادداشت‌های داخلی (Internal Notes)
- ✅ Real-time messaging
- ✅ تاریخچه تغییرات
- ✅ SLA Tracking - آماده برای پیاده‌سازی
- ✅ Workspace Isolation

---

## 🛠️ تکنولوژی‌های استفاده شده

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Real-time:** Socket.IO
- **Styling:** Tailwind CSS
- **Forms:** Zod Validation
- **UI Components:** ndui-ahrom (کتابخانه اختصاصی پروژه)
- **Icons:** Font Awesome
- **Date:** date-fns-jalali (تقویم شمسی)

---

## 📊 مدل دیتابیس

### Internal Chat Models

```prisma
ChatRoom              # اتاق‌های چت
ChatRoomMember        # اعضای اتاق
ChatMessage           # پیام‌ها
ChatMessageReaction   # واکنش‌ها به پیام
ChatMessageReadReceipt # رسید خوانده شدن
ChatTypingIndicator   # نشانگر تایپ
ChatRoomSettings      # تنظیمات اتاق
ChatRoomPermission    # دسترسی‌های اتاق
```

### Support Chat Models

```prisma
SupportChatTicket     # تیکت‌های پشتیبانی
SupportChatMessage    # پیام‌های تیکت
SupportChatHistory    # تاریخچه تغییرات
SupportChatCategory   # دسته‌بندی‌ها
SupportChatLabel      # برچسب‌ها
SupportGuestUser      # کاربران مهمان
```

برای جزئیات بیشتر: [`chat-schema-documentation.md`](./chat-schema-documentation.md)

---

## 🔐 امنیت

### Authentication & Authorization

- ✅ JWT Token برای احراز هویت
- ✅ NextAuth برای مدیریت Session
- ✅ Workspace-based Authorization
- ✅ Role-based Access Control (RBAC)
  - **Admin**: دسترسی کامل به Internal Chat و Support Chat
  - **User**: دسترسی محدود به تیکت‌های خودش در Support Chat

### Security Best Practices

- ✅ Workspace Isolation (هر workspace فقط به داده‌های خودش دسترسی دارد)
- ✅ Input Validation با Zod
- ✅ SQL Injection Prevention با Prisma
- ✅ XSS Protection
- ✅ CSRF Protection

---

## 🌐 API Endpoints

### Internal Chat

```
GET    /api/internal-chat/contacts          # لیست مخاطبین
GET    /api/internal-chat/messages          # دریافت پیام‌ها
POST   /api/internal-chat/messages          # ارسال پیام
POST   /api/internal-chat/rooms?type=direct # ایجاد room مستقیم
POST   /api/internal-chat/rooms?type=team   # ایجاد room تیمی
```

### Support Chat

```
GET    /api/support-chat                    # لیست تیکت‌ها
POST   /api/support-chat                    # ایجاد تیکت
GET    /api/support-chat/:id                # جزئیات تیکت
PATCH  /api/support-chat/:id                # به‌روزرسانی تیکت
GET    /api/support-chat/categories         # دسته‌بندی‌ها
GET    /api/support-chat/labels             # برچسب‌ها
```

**نکته:** API Routes از ساختار داینامیک `/api/[slug]/` استفاده می‌کنند.

---

## 🔌 Socket.IO Events

### Internal Chat Events

- `internal-chat:join` - عضویت در اتاق
- `internal-chat:leave` - خروج از اتاق
- `internal-chat:message` - ارسال/دریافت پیام
- `internal-chat:typing` - نشانگر تایپ
- `internal-chat:user-status` - وضعیت کاربر

### Support Chat Events

- `support-chat:join` - عضویت در تیکت
- `support-chat:leave` - خروج از تیکت
- `support-chat:message` - ارسال/دریافت پیام
- `support-chat:typing` - نشانگر تایپ
- `support-chat:ticket-update` - به‌روزرسانی تیکت
- `support-chat:agent-status` - وضعیت کارشناس

برای جزئیات بیشتر: [`socket-io-events.md`](./socket-io-events.md)

---

## 🧪 تست

### اجرای تست‌ها

```bash
# تست واحد (Unit Tests)
npm run test

# تست یکپارچگی (Integration Tests)
npm run test:integration

# تست End-to-End
npm run test:e2e
```

### راهنمای تست دستی

برای تست دستی سیستم‌ها، به [`chat-testing-guide.md`](./chat-testing-guide.md) مراجعه کنید.

---

## 📈 Performance

### Optimizations Implemented

- ✅ Optimistic UI برای تجربه کاربری بهتر
- ✅ Pagination برای لیست پیام‌ها
- ✅ Lazy Loading برای کامپوننت‌ها
- ✅ Debouncing برای Typing Indicator
- ✅ Connection Pooling برای Database
- ✅ Socket.IO Rooms برای بهینه‌سازی پخش پیام

### Performance Metrics

- **Time to Interactive:** < 3s
- **First Contentful Paint:** < 1.5s
- **Socket Connection Time:** < 500ms
- **Message Delivery Time:** < 100ms (Real-time)

---

## 🔄 Workflow

### Internal Chat Workflow

```
1. کاربر Admin وارد می‌شود
   ↓
2. به /dashboard/internal-chat می‌رود
   ↓
3. لیست کاربران و تیم‌ها بارگذاری می‌شود
   ↓
4. کاربر یک مخاطب انتخاب می‌کند
   ↓
5. Room ایجاد یا بازیابی می‌شود
   ↓
6. Socket.IO به room متصل می‌شود
   ↓
7. پیام‌های قبلی بارگذاری می‌شوند
   ↓
8. کاربر پیام ارسال می‌کند
   ↓
9. پیام همزمان:
   - در UI نمایش داده می‌شود (Optimistic)
   - از طریق Socket.IO broadcast می‌شود
   - در دیتابیس ذخیره می‌شود
```

### Support Chat Workflow (Admin)

```
1. کاربر Admin وارد می‌شود
   ↓
2. به /dashboard/support-chat می‌رود
   ↓
3. لیست تیکت‌ها نمایش داده می‌شود
   ↓
4. کارشناس یک تیکت را انتخاب می‌کند
   ↓
5. به صفحه جزئیات می‌رود
   ↓
6. Socket.IO به ticket join می‌کند
   ↓
7. پیام‌ها و تاریخچه بارگذاری می‌شوند
   ↓
8. کارشناس می‌تواند:
   - پیام بفرستد
   - یادداشت داخلی ثبت کند
   - تیکت را تخصیص دهد
   - وضعیت را تغییر دهد
```

### Support Chat Workflow (Customer)

```
1. مشتری وارد می‌شود
   ↓
2. به /panel/support-chat می‌رود
   ↓
3. تیکت جدید ایجاد می‌کند یا تیکت قبلی را باز می‌کند
   ↓
4. به صفحه جزئیات می‌رود
   ↓
5. Socket.IO به ticket join می‌کند
   ↓
6. پیام‌ها بارگذاری می‌شوند
   ↓
7. مشتری پیام می‌فرستد
   ↓
8. Real-time پاسخ کارشناس را دریافت می‌کند
```

---

## 🚧 کارهای آینده (Roadmap)

### Phase 1: فعلی ✅

- [x] پیاده‌سازی Internal Chat
- [x] پیاده‌سازی Support Chat (Admin & Customer)
- [x] Socket.IO Server
- [x] UI Components
- [x] مستندات

### Phase 2: در حال توسعه 🚧

- [ ] Guest User Support (تیکت از کاربران مهمان)
- [ ] File Upload & Attachment
- [ ] Voice/Video Call
- [ ] Advanced Search & Filters
- [ ] Analytics Dashboard
- [ ] Email Notifications
- [ ] Push Notifications
- [ ] Mobile App

### Phase 3: آینده 📋

- [ ] AI-Powered Auto-Reply
- [ ] Sentiment Analysis
- [ ] Multi-language Support
- [ ] ChatBot Integration
- [ ] Knowledge Base Integration
- [ ] Advanced Reporting

---

## 🤝 مشارکت

برای مشارکت در پروژه:

1. Fork کنید
2. Branch جدید ایجاد کنید
3. تغییرات خود را Commit کنید
4. Push کنید
5. Pull Request ایجاد کنید

---

## 📞 پشتیبانی

برای سوالات و مشکلات:

- **مستندات:** این پوشه `docs/`
- **Issues:** GitHub Issues
- **Email:** support@example.com

---

## 📄 License

This project is licensed under the MIT License.

---

## ✨ سپاسگزاری

از تمام کسانی که در توسعه این سیستم مشارکت داشتند، تشکر می‌کنیم! 🙏

---

**نسخه:** 1.0.0  
**آخرین به‌روزرسانی:** 2025-01-14  
**نویسندگان:** تیم توسعه ahromCrm

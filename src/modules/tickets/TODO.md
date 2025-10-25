# TODO - Tickets Module

## تکمیل شده ✅

### 1. ساختار ماژول

- [x] ایجاد ماژول `tickets` با ساختار استاندارد
- [x] انتقال فایل‌های مربوط به تیکت از `support-chat` به `tickets`
- [x] ساده‌سازی ماژول `support-chat`

### 2. API Routes

- [x] `/api/tickets` - لیست تیکت‌ها و ایجاد تیکت جدید
- [x] `/api/tickets/my-tickets` - تیکت‌های کاربر فعلی
- [x] `/api/tickets/[id]` - جزئیات تیکت
- [x] `/api/tickets/[id]/status` - تغییر وضعیت تیکت
- [x] `/api/tickets/[id]/assign` - تخصیص تیکت

### 3. Components

- [x] `TicketList` - لیست تیکت‌ها با قابلیت Load More
- [x] `TicketCard` - کارت نمایش تیکت
- [x] `TicketFilters` - فیلترهای تیکت
- [x] `TicketStats` - آمار تیکت‌ها
- [x] `AssignTicketModal` - مودال تخصیص تیکت
- [x] `ChangeStatusModal` - مودال تغییر وضعیت

### 4. Pages

- [x] `/dashboard/tickets` - صفحه اصلی تیکت‌ها
- [x] `/dashboard/tickets/view/[id]` - صفحه جزئیات تیکت (کاملاً سفارشی)
- [x] `/dashboard/tickets/create` - صفحه ایجاد تیکت (کاملاً سفارشی)

### 5. Hooks & Services

- [x] `useTickets` - هوک مدیریت تیکت‌ها
- [x] `TicketsServiceApi` - سرویس API تیکت‌ها
- [x] `TicketsRepository` - ریپازیتوری تیکت‌ها

## در حال توسعه 🚧

### 1. Chat Integration

- [ ] **بخش چت در صفحه جزئیات تیکت**
  - [ ] اضافه کردن کامپوننت چت به صفحه جزئیات
  - [ ] اتصال به Socket.IO برای پیام‌های real-time
  - [ ] نمایش تاریخچه پیام‌ها
  - [ ] قابلیت ارسال پیام جدید
  - [ ] نمایش وضعیت آنلاین/آفلاین کاربران

### 2. Ticket Detail Card

- [ ] **کارت جزئیات تیکت در کنار چت**
  - [ ] نمایش اطلاعات کامل تیکت
  - [ ] دکمه‌های تغییر وضعیت و تخصیص
  - [ ] نمایش تاریخ‌ها و آمار
  - [ ] قابلیت ویرایش سریع

### 3. Advanced Features

- [ ] **ویژگی‌های پیشرفته**
  - [ ] اتصال فایل به تیکت
  - [ ] سیستم اعلان‌ها
  - [ ] تاریخچه تغییرات
  - [ ] کامنت‌های داخلی
  - [ ] تگ‌گذاری تیکت‌ها

## توضیحات آینده 📝

### Chat Section Integration

بخش چت در صفحه جزئیات تیکت باید شامل موارد زیر باشد:

1. **Layout Design:**

   ```
   [Ticket Detail Card] | [Chat Messages]
   [Quick Actions]      | [Message Input]
   ```

2. **Features:**

   - Real-time messaging via Socket.IO
   - Message history loading
   - Typing indicators
   - Online/offline status
   - File attachments
   - Message actions (edit, delete, reply)

3. **Components Needed:**
   - `TicketChatWindow` (from support-chat module)
   - `TicketMessageBubble`
   - `TicketMessageInput`
   - `TicketDetailCard` (new component)

### Ticket Detail Card

کارت جزئیات تیکت باید شامل:

1. **Information Display:**

   - Ticket number and subject
   - Status and priority badges
   - Customer information
   - Assignment details
   - Creation and update dates

2. **Quick Actions:**

   - Change status button
   - Assign ticket button
   - Edit ticket button
   - View history button

3. **Real-time Updates:**
   - Auto-refresh when status changes
   - Live assignment updates
   - Notification badges

### Integration Points

- استفاده از `useTickets` hook برای مدیریت state
- اتصال به Socket.IO برای real-time updates
- استفاده از کامپوننت‌های موجود در `support-chat`
- طراحی responsive برای موبایل و دسکتاپ

## Notes

- تمام صفحات بدون استفاده از wrapperهای عمومی پیاده‌سازی شده‌اند
- UI کاملاً سفارشی و responsive است
- آماده برای اضافه کردن بخش چت و کارت جزئیات

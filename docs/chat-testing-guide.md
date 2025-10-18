# راهنمای تست سیستم‌های Chat

این سند شامل راهنمای کامل تست و Debug سیستم‌های Internal Chat و Support Chat است.

## 📋 پیش‌نیازها

### 1. نصب Dependencies

مطمئن شوید که پکیج‌های زیر نصب شده باشند:

```bash
npm install socket.io socket.io-client
# یا
yarn add socket.io socket.io-client
```

### 2. بررسی Database Schema

مطمئن شوید که migration های Prisma اجرا شده باشند:

```bash
npx prisma migrate dev
# یا برای production
npx prisma migrate deploy
```

### 3. بررسی Environment Variables

فایل `.env` شما باید شامل موارد زیر باشد:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🧪 تست Internal Chat (چت درون سازمانی)

### مرحله 1: راه‌اندازی سرور

```bash
npm run dev
# یا
yarn dev
```

### مرحله 2: ورود به سیستم

1. به `/login` بروید
2. با یک کاربر Admin وارد شوید
3. یک Workspace انتخاب کنید

### مرحله 3: دسترسی به Internal Chat

1. از منو، گزینه **"چت درون سازمانی"** را انتخاب کنید
2. مسیر: `/dashboard/internal-chat`

### مرحله 4: تست عملکردها

#### 4.1 تست لیست مخاطبین

**انتظار:**

- ✅ لیست کاربران Admin نمایش داده شود
- ✅ لیست تیم‌ها (که کاربر فعلی عضو Admin آنهاست) نمایش داده شود
- ✅ جستجو در مخاطبین کار کند
- ✅ تب‌های "کاربران" و "گروه‌ها" کار کنند

**Debug:**

```javascript
// Console Browser:
// 1. بررسی درخواست API
// Network Tab → XHR → /api/internal-chat/contacts

// 2. بررسی Response
{
  "users": [...],  // باید آرایه‌ای از کاربران Admin برگردد
  "teams": [...]   // باید آرایه‌ای از تیم‌ها برگردد
}
```

#### 4.2 تست Direct Chat (چت با کاربر)

**مراحل:**

1. یک کاربر را از لیست انتخاب کنید
2. صبر کنید تا room ایجاد شود
3. پیامی ارسال کنید

**انتظار:**

- ✅ Room به درستی ایجاد یا بازیابی شود
- ✅ پیام در UI نمایش داده شود (Optimistic UI)
- ✅ Socket.IO متصل شود
- ✅ پیام به دیتابیس ذخیره شود

**Debug:**

```javascript
// Console Browser:
console.log("Socket connected:", socket.connected);
console.log("Room ID:", selectedRoom?.id);

// بررسی Events
socket.on("internal-chat:joined", (data) => {
  console.log("✅ Joined room:", data);
});

socket.on("internal-chat:message", (message) => {
  console.log("📨 New message:", message);
});
```

#### 4.3 تست Team Chat (چت گروهی)

**مراحل:**

1. تب "گروه‌ها" را انتخاب کنید
2. یک تیم را انتخاب کنید
3. پیامی ارسال کنید

**انتظار:**

- ✅ Team room ایجاد شود با تمام اعضای Admin
- ✅ پیام برای همه اعضا نمایش داده شود

#### 4.4 تست Real-time Features

**برای تست Real-time، دو مرورگر/Tab باز کنید:**

**Tab 1:**

```javascript
// کاربر A وارد شده
// به room X متصل شده
```

**Tab 2:**

```javascript
// کاربر B وارد شده
// به همان room X متصل شده
```

**تست‌ها:**

1. **پیام‌رسانی:** پیام از Tab 1 ارسال کنید → باید در Tab 2 فوری نمایش داده شود
2. **Typing Indicator:** در Tab 1 شروع به تایپ کنید → باید در Tab 2 "در حال نوشتن..." نمایش داده شود
3. **Online Status:** کاربر A آفلاین شود → باید در Tab 2 به‌روز شود

---

## 🎫 تست Support Chat (چت پشتیبانی)

### مرحله 1: تست از طریق Admin Panel

#### 1.1 دسترسی به Support Chat

1. از منو، گزینه **"چت پشتیبانی مشتریان"** را انتخاب کنید
2. مسیر: `/dashboard/support-chat`

#### 1.2 تست لیست تیکت‌ها

**انتظار:**

- ✅ تب‌های "باز"، "در حال بررسی"، "همه" نمایش داده شوند
- ✅ فیلترها (وضعیت، اولویت، دسته‌بندی) کار کنند
- ✅ جدول تیکت‌ها با اطلاعات کامل نمایش داده شود

#### 1.3 تست مشاهده تیکت

**مراحل:**

1. روی یک تیکت کلیک کنید
2. صفحه جزئیات باز شود

**انتظار:**

- ✅ اطلاعات تیکت نمایش داده شود
- ✅ لیست پیام‌ها بارگذاری شود
- ✅ امکان ارسال پیام عادی وجود داشته باشد
- ✅ امکان ارسال یادداشت داخلی (Internal Note) وجود داشته باشد

**Debug:**

```javascript
// بررسی بارگذاری تیکت
console.log("Ticket:", ticket);
console.log("Messages:", messages);

// بررسی Socket.IO
socket.on("support-chat:joined", (data) => {
  console.log("✅ Joined ticket:", data);
});
```

#### 1.4 تست ارسال پیام

**تست 1: پیام عادی**

```
1. متنی بنویسید
2. دکمه ارسال را کلیک کنید
3. پیام باید در لیست ظاهر شود
```

**تست 2: یادداشت داخلی**

```
1. چک‌باکس "یادداشت داخلی" را فعال کنید
2. متنی بنویسید
3. ارسال کنید
4. پیام باید با پس‌زمینه بنفش نمایش داده شود
```

#### 1.5 تست تخصیص تیکت

**مراحل:**

1. دکمه "تخصیص به کارشناس" را کلیک کنید
2. یک کارشناس را انتخاب کنید
3. تایید کنید

**انتظار:**

- ✅ تیکت به کارشناس تخصیص داده شود
- ✅ در panel سمت راست، نام کارشناس نمایش داده شود
- ✅ رکورد history ثبت شود

#### 1.6 تست تغییر وضعیت

**مراحل:**

1. دکمه "تغییر وضعیت" را کلیک کنید
2. وضعیت جدید را انتخاب کنید
3. تایید کنید

**انتظار:**

- ✅ وضعیت تیکت تغییر کند
- ✅ Badge وضعیت به‌روز شود
- ✅ رکورد history ثبت شود

### مرحله 2: تست از طریق Customer Panel

#### 2.1 دسترسی به Support Chat (مشتری)

1. با یک کاربر User وارد شوید
2. مسیر: `/panel/support-chat`

#### 2.2 تست ایجاد تیکت جدید

**مراحل:**

1. دکمه "تیکت جدید" را کلیک کنید
2. فرم را پر کنید:
   - موضوع
   - توضیحات
   - اولویت
   - دسته‌بندی (اختیاری)
3. ارسال کنید

**انتظار:**

- ✅ تیکت ایجاد شود
- ✅ شماره تیکت با prefix `CUST-` باشد
- ✅ به صفحه جزئیات هدایت شود

**Debug:**

```javascript
// بررسی Response
{
  "id": 1,
  "ticketNumber": "CUST-1-1",
  "subject": "...",
  "status": "OPEN",
  "priority": "MEDIUM"
}
```

#### 2.3 تست چت با پشتیبانی

**مراحل:**

1. وارد یک تیکت شوید
2. پیامی ارسال کنید
3. منتظر پاسخ کارشناس بمانید

**انتظار:**

- ✅ پیام مشتری در سمت راست نمایش داده شود (پس‌زمینه آبی/سبز)
- ✅ پیام کارشناس در سمت چپ نمایش داده شود (پس‌زمینه خاکستری)
- ✅ یادداشت‌های داخلی برای مشتری نمایش داده نشود

### مرحله 3: تست Guest User (کاربر مهمان)

**این بخش برای آینده است - فعلاً پیاده‌سازی نشده**

---

## 🐛 مشکلات رایج و راه‌حل‌ها

### 1. Socket.IO متصل نمی‌شود

**علت احتمالی:**

- سرور Next.js اجرا نشده
- Path اشتباه است

**راه‌حل:**

```javascript
// بررسی کنید که path درست است:
const socket = io({ path: "/api/socket_io" });

// بررسی اتصال:
socket.on("connect", () => console.log("✅ Connected"));
socket.on("connect_error", (err) => console.error("❌ Error:", err));
```

### 2. پیام‌ها ارسال نمی‌شوند

**علت احتمالی:**

- Room join نشده
- Socket متصل نیست
- Payload اشتباه است

**راه‌حل:**

```javascript
// 1. مطمئن شوید که room join شده:
socket.emit("internal-chat:join", roomId);

// 2. صبر کنید تا joined event دریافت شود:
socket.on("internal-chat:joined", () => {
  // حالا می‌توانید پیام بفرستید
  socket.emit("internal-chat:message", { roomId, body: "..." });
});
```

### 3. پیام‌ها duplicate می‌شوند

**علت:**

- Listener چندین بار register شده

**راه‌حل:**

```javascript
// همیشه cleanup کنید:
useEffect(() => {
  const handler = (msg) => console.log(msg);
  socket.on("internal-chat:message", handler);

  return () => {
    socket.off("internal-chat:message", handler);
  };
}, []);
```

### 4. خطای 401 Unauthorized

**علت:**

- Token نامعتبر یا منقضی شده
- Workspace انتخاب نشده

**راه‌حل:**

```javascript
// بررسی کنید که Header ها درست ارسال می‌شوند:
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
axios.defaults.headers.common["X-Workspace-Id"] = workspaceId;
```

### 5. لیست مخاطبین خالی است

**علت احتمالی:**

- کاربر Admin نیست
- تیمی وجود ندارد
- در workspace عضو نیست

**راه‌حل:**

```javascript
// بررسی role:
console.log("User Role:", activeWorkspace?.role?.name);
// باید "Admin" باشد

// بررسی Response API:
const { users, teams } = await repo.getContacts();
console.log("Users:", users.length);
console.log("Teams:", teams.length);
```

---

## ✅ چک‌لیست تست کامل

### Internal Chat

- [ ] اتصال Socket.IO موفقیت‌آمیز است
- [ ] لیست کاربران Admin نمایش داده می‌شود
- [ ] لیست تیم‌ها نمایش داده می‌شود
- [ ] جستجو در مخاطبین کار می‌کند
- [ ] Direct room ایجاد/بازیابی می‌شود
- [ ] Team room ایجاد/بازیابی می‌شود
- [ ] ارسال پیام کار می‌کند
- [ ] دریافت پیام real-time کار می‌کند
- [ ] Typing indicator کار می‌کند
- [ ] Online status کار می‌کند
- [ ] Optimistic UI کار می‌کند
- [ ] Error handling درست است
- [ ] Cleanup on unmount انجام می‌شود

### Support Chat (Admin)

- [ ] لیست تیکت‌ها نمایش داده می‌شود
- [ ] فیلترها کار می‌کنند
- [ ] تب‌ها کار می‌کنند
- [ ] مشاهده تیکت کار می‌کند
- [ ] لیست پیام‌ها بارگذاری می‌شود
- [ ] ارسال پیام عادی کار می‌کند
- [ ] ارسال یادداشت داخلی کار می‌کند
- [ ] تخصیص تیکت کار می‌کند
- [ ] تغییر وضعیت کار می‌کند
- [ ] Real-time updates کار می‌کند
- [ ] History ثبت می‌شود

### Support Chat (Customer)

- [ ] ایجاد تیکت جدید کار می‌کند
- [ ] شماره تیکت با prefix CUST- است
- [ ] لیست تیکت‌های خودم نمایش داده می‌شود
- [ ] مشاهده تیکت کار می‌کند
- [ ] ارسال پیام کار می‌کند
- [ ] دریافت پاسخ کارشناس real-time است
- [ ] یادداشت‌های داخلی نمایش داده نمی‌شوند
- [ ] Message alignment درست است (راست/چپ)

---

## 📊 Performance Testing

### Load Testing

برای تست عملکرد تحت بار، از ابزارهای زیر استفاده کنید:

```bash
# نصب Artillery
npm install -g artillery

# اجرای تست
artillery quick --count 10 --num 5 http://localhost:3000/api/internal-chat/contacts
```

### Memory Leak Detection

```javascript
// بررسی Memory Leaks در Browser DevTools:
// 1. Performance Tab → Memory
// 2. Take Heap Snapshot قبل و بعد از اتصال/قطع Socket.IO
// 3. مقایسه کنید
```

---

## 🔍 Debugging Tips

### 1. Enable Verbose Logging

در `socket_io.ts`:

```typescript
const io = new IOServer(res.socket.server as any, {
  path: "/api/socket_io",
  cors: { origin: "*" },
  // اضافه کنید:
  transports: ["websocket", "polling"],
  allowEIO3: true,
});
```

### 2. Monitor Network Traffic

در Browser DevTools:

```
Network Tab → WS (WebSocket) → بررسی Frames
```

### 3. Server-Side Logging

در `socket_io.ts` لاگ‌های بیشتری اضافه کنید:

```typescript
socket.on("internal-chat:message", (payload) => {
  console.log("[MESSAGE RECEIVED]", {
    socketId: socket.id,
    payload,
    timestamp: new Date().toISOString(),
  });
});
```

---

## 📝 یادداشت‌های نهایی

1. **همیشه در Development Mode تست کنید**
2. **از دو مرورگر مختلف برای تست Real-time استفاده کنید**
3. **Log های Console را بررسی کنید**
4. **Network Tab را مانیتور کنید**
5. **Database را بررسی کنید که رکوردها ذخیره می‌شوند**

---

**موفق باشید! 🚀**

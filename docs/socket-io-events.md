# Socket.IO Events Documentation

این سند تمام رویدادهای Socket.IO برای سیستم‌های چت درون سازمانی و چت پشتیبانی را شرح می‌دهد.

## 📡 Connection

### Server Path

```
/api/socket_io
```

### Client Connection

```typescript
import { io } from "socket.io-client";

const socket = io({
  path: "/api/socket_io",
});
```

---

## 💬 Internal Chat (چت درون سازمانی)

### 1. Join Room (عضویت در اتاق)

**Event:** `internal-chat:join`

**Direction:** Client → Server

**Payload:**

```typescript
{
  roomId: number; // شناسه اتاق چت
}
```

**Response Event:** `internal-chat:joined`

**Response Payload:**

```typescript
{
  roomId: number;
}
```

---

### 2. Leave Room (خروج از اتاق)

**Event:** `internal-chat:leave`

**Direction:** Client → Server

**Payload:**

```typescript
{
  roomId: number; // شناسه اتاق چت
}
```

---

### 3. Send Message (ارسال پیام)

**Event:** `internal-chat:message`

**Direction:** Client → Server (and Server → All Clients in Room)

**Client Sends:**

```typescript
{
  roomId: number;        // شناسه اتاق
  body: string;          // متن پیام
  tempId?: string;       // شناسه موقت (برای Optimistic UI)
  senderId?: number;     // شناسه فرستنده
}
```

**Server Broadcasts:**

```typescript
{
  id: string;            // شناسه پیام (یا tempId)
  roomId: number;
  body: string;
  senderId?: number;
  createdAt: string;     // ISO timestamp
  isOwnMessage: false;
}
```

---

### 4. Typing Indicator (نشانگر در حال تایپ)

**Event:** `internal-chat:typing`

**Direction:** Client → Server (and Server → Other Clients in Room)

**Client Sends:**

```typescript
{
  roomId: number;
  isTyping: boolean;     // true = شروع تایپ, false = توقف
  userId?: number;
  userName?: string;
}
```

**Server Broadcasts (to others only):**

```typescript
{
  roomId: number;
  isTyping: boolean;
  userId?: number;
  userName?: string;
  timestamp: number;     // Unix timestamp
}
```

---

### 5. User Status (وضعیت کاربر)

**Event:** `internal-chat:set-status`

**Direction:** Client → Server

**Payload:**

```typescript
{
  userId: number;
  status: "online" | "offline";
}
```

**Server Broadcasts:** `internal-chat:user-status`

**Broadcast Payload:**

```typescript
{
  userId: number;
  status: "online" | "offline";
  timestamp: number;
}
```

---

## 🎫 Support Chat (چت پشتیبانی)

### 1. Join Ticket (عضویت در تیکت)

**Event:** `support-chat:join`

**Direction:** Client → Server

**Payload:**

```typescript
{
  ticketId: number; // شناسه تیکت
}
```

**Response Event:** `support-chat:joined`

**Response Payload:**

```typescript
{
  ticketId: number;
}
```

---

### 2. Leave Ticket (خروج از تیکت)

**Event:** `support-chat:leave`

**Direction:** Client → Server

**Payload:**

```typescript
{
  ticketId: number;
}
```

---

### 3. Send Message (ارسال پیام)

**Event:** `support-chat:message`

**Direction:** Client → Server (and Server → All Clients in Ticket)

**Client Sends:**

```typescript
{
  ticketId: number;
  body: string;
  tempId?: string;
  senderId?: number;
  senderType?: "agent" | "customer" | "guest";  // نوع فرستنده
  isInternal?: boolean;  // آیا یادداشت داخلی است؟
}
```

**Server Broadcasts:**

```typescript
{
  id: string;
  ticketId: number;
  body: string;
  senderId?: number;
  senderType: "agent" | "customer" | "guest";
  isInternal: boolean;
  createdAt: string;
}
```

---

### 4. Typing Indicator

**Event:** `support-chat:typing`

**Direction:** Client → Server (and Server → Other Clients)

**Client Sends:**

```typescript
{
  ticketId: number;
  isTyping: boolean;
  userId?: number;
  userName?: string;
}
```

**Server Broadcasts (to others only):**

```typescript
{
  ticketId: number;
  isTyping: boolean;
  userId?: number;
  userName?: string;
  timestamp: number;
}
```

---

### 5. Ticket Update (به‌روزرسانی تیکت)

**Event:** `support-chat:ticket-update`

**Direction:** Client → Server (and Server → All Clients)

**Client Sends:**

```typescript
{
  ticketId: number;
  status?: string;        // "OPEN", "IN_PROGRESS", "RESOLVED", etc.
  assignedTo?: number;    // شناسه کارشناس تخصیص یافته
  priority?: string;      // "LOW", "MEDIUM", "HIGH", "CRITICAL"
}
```

**Server Broadcasts:**

```typescript
{
  ticketId: number;
  status?: string;
  assignedTo?: number;
  priority?: string;
  timestamp: number;
}
```

---

### 6. Agent Status (وضعیت کارشناس)

**Event:** `support-chat:agent-status`

**Direction:** Client → Server (and Server → All Clients)

**Client Sends:**

```typescript
{
  agentId: number;
  status: "available" | "busy" | "offline";
}
```

**Server Broadcasts:**

```typescript
{
  agentId: number;
  status: "available" | "busy" | "offline";
  timestamp: number;
}
```

---

## 🔌 Disconnect

سرور به طور خودکار از اتصاع‌ها آگاه شده و:

- کاربران آنلاین را پاکسازی می‌کند
- در صورت نداشتن socket فعال، وضعیت کاربر را `offline` می‌کند

---

## 💡 نکات مهم

### 1. Room Naming Convention

- **Internal Chat:** `internal-chat:{roomId}`
- **Support Chat:** `support-chat:{ticketId}`

### 2. Optimistic UI

برای بهبود تجربه کاربری، از `tempId` برای پیام‌های موقت استفاده کنید:

```typescript
const tempId = `temp-${Date.now()}`;
// Add message to UI immediately
addMessageToUI({ id: tempId, body: messageBody, ... });

// Send via Socket.IO
socket.emit("internal-chat:message", {
  roomId,
  body: messageBody,
  tempId
});

// Also save to database via HTTP
await api.sendMessage(roomId, { body: messageBody });
```

### 3. Error Handling

همیشه از try-catch برای مدیریت خطاها استفاده کنید:

```typescript
socket.on("error", (error) => {
  console.error("Socket.IO Error:", error);
});

socket.on("connect_error", (error) => {
  console.error("Connection Error:", error);
});
```

### 4. Cleanup on Unmount

همیشه listeners را در cleanup کنید:

```typescript
useEffect(() => {
  socket.on("internal-chat:message", handleMessage);

  return () => {
    socket.off("internal-chat:message", handleMessage);
  };
}, []);
```

---

## 📚 مثال‌های عملی

### Internal Chat - Send Message

```typescript
const sendMessage = (roomId: number, body: string) => {
  const tempId = `temp-${Date.now()}`;

  // Optimistic UI
  setMessages((prev) => [
    ...prev,
    {
      id: tempId,
      body,
      isOwnMessage: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  // Real-time via Socket.IO
  socket.emit("internal-chat:message", { roomId, body, tempId });

  // Persistence via HTTP
  api.sendMessage(roomId, { body }).catch((err) => {
    // Remove temp message on error
    setMessages((prev) => prev.filter((m) => m.id !== tempId));
    console.error("Failed to send message:", err);
  });
};
```

### Support Chat - Listen for Ticket Updates

```typescript
useEffect(() => {
  const handleTicketUpdate = (data: any) => {
    console.log("Ticket updated:", data);

    if (data.ticketId === currentTicketId) {
      setTicket((prev) => ({
        ...prev,
        status: data.status || prev.status,
        assignedTo: data.assignedTo || prev.assignedTo,
        priority: data.priority || prev.priority,
      }));
    }
  };

  socket.on("support-chat:ticket-update", handleTicketUpdate);

  return () => {
    socket.off("support-chat:ticket-update", handleTicketUpdate);
  };
}, [currentTicketId]);
```

---

## 🔐 Security Considerations

1. **Authentication:** همیشه هویت کاربر را در سمت سرور تایید کنید
2. **Authorization:** مطمئن شوید کاربر دسترسی به اتاق/تیکت را دارد
3. **Rate Limiting:** برای جلوگیری از spam، rate limiting اعمال کنید
4. **Input Validation:** تمام ورودی‌ها را validate کنید

---

## 🎯 Performance Tips

1. استفاده از `socket.to(room)` به جای `io.to(room)` برای بهینه‌سازی
2. محدود کردن تعداد پیام‌های ارسالی در هر ثانیه
3. استفاده از compression برای پیام‌های بزرگ
4. پیاده‌سازی pagination برای تاریخچه پیام‌ها

---

**نسخه:** 1.0.0  
**آخرین به‌روزرسانی:** 2025-01-14

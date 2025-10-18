# Ticket Detail View Module

این ماژول شامل کامپوننت‌های مربوط به نمایش جزئیات تیکت پشتیبانی است.

## ساختار فایل‌ها

```
view/
├── page.tsx                    # صفحه اصلی (Entry point)
├── TicketDetailWrapper.tsx     # Wrapper component اصلی
├── hooks/
│   └── useTicketDetailState.ts # Hook مدیریت state
├── components/
│   ├── LoadingSpinner.tsx      # کامپوننت loading
│   ├── ErrorState.tsx          # کامپوننت error
│   └── TicketDetailLayout.tsx  # Layout اصلی
├── index.ts                    # Export ها
└── README.md                   # مستندات
```

## کامپوننت‌ها

### `TicketDetailPage`

صفحه اصلی که به عنوان entry point عمل می‌کند و فقط wrapper را فراخوانی می‌کند.

### `TicketDetailWrapper`

کامپوننت اصلی که منطق business را مدیریت می‌کند و از hook های custom استفاده می‌کند.

### `useTicketDetailState`

Hook اصلی که تمام state management و side effects را مدیریت می‌کند.

## ویژگی‌ها

- ✅ **ماژولار**: جداسازی منطق به کامپوننت‌های کوچک
- ✅ **Clean Code**: کد تمیز و قابل خواندن
- ✅ **Type Safety**: استفاده کامل از TypeScript
- ✅ **Reusable**: کامپوننت‌های قابل استفاده مجدد
- ✅ **Error Handling**: مدیریت خطا در تمام سطوح
- ✅ **Performance**: بهینه‌سازی با useCallback و useMemo
- ✅ **Responsive**: طراحی responsive

## استفاده

```tsx
import { TicketDetailPage } from "./view";

// در صفحه اصلی
<TicketDetailPage id={ticketId} isAdmin={true} backUrl="/dashboard" />;
```

## Hook ها

### `useTicketDetailState`

مدیریت کامل state و side effects:

```tsx
const {
  ticketState,
  messageState,
  sendMessage,
  loadMoreMessages,
  assignTicket,
  updateTicketStatus,
  handleBack,
} = useTicketDetailState({
  ticketId: id,
  isAdmin: true,
  backUrl: "/dashboard",
});
```

## کامپوننت‌های UI

### `LoadingSpinner`

نمایش loading state با پیام قابل تنظیم.

### `ErrorState`

نمایش error state با دکمه بازگشت.

### `TicketDetailLayout`

Layout اصلی شامل chat window و detail panel.

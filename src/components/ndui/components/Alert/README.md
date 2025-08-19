# Alert Component

## English

A versatile alert component for displaying messages with different types and optional close functionality.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'info' \| 'success' \| 'warning' \| 'error' | 'info' | The type of alert to display |
| message | ReactNode | - | The content to display in the alert |
| onClose | () => void | - | Optional callback for handling alert dismissal |
| autoClose | number | - | Optional duration (in ms) after which the alert will automatically close |

### Features

- Four different alert types with appropriate icons
- Optional close button
- Auto-close functionality
- Proper ARIA attributes for accessibility
- Automatic cleanup of timeouts
- Responsive design

### Usage

```tsx
import { Alert } from 'ndui-ahrom';

// Basic usage
<Alert message="This is an info alert" />

// Success alert with auto-close
<Alert 
  type="success"
  message="Operation completed successfully"
  autoClose={3000}
  onClose={() => console.log('Alert closed')}
/>

// Warning alert with close button
<Alert 
  type="warning"
  message="Please review your changes"
  onClose={() => console.log('Alert closed')}
/>

// Error alert
<Alert
  type="error"
  message="An error occurred"
/>
```

### Accessibility

- Uses appropriate ARIA roles and attributes
- Icons are properly hidden from screen readers
- Close button has descriptive label
- Alert messages are announced to screen readers

## فارسی

کامپوننت هشدار چندمنظوره برای نمایش پیام‌ها با انواع مختلف و قابلیت بستن اختیاری.

### پراپ‌ها

| پراپ | نوع | پیش‌فرض | توضیحات |
|------|------|---------|----------|
| type | 'info' \| 'success' \| 'warning' \| 'error' | 'info' | نوع هشدار برای نمایش |
| message | ReactNode | - | محتوای نمایش داده شده در هشدار |
| onClose | () => void | - | تابع فراخوانی اختیاری برای مدیریت بستن هشدار |
| autoClose | number | - | مدت زمان اختیاری (به میلی‌ثانیه) پس از آن هشدار به طور خودکار بسته می‌شود |

### ویژگی‌ها

- چهار نوع مختلف هشدار با آیکون‌های مناسب
- دکمه بستن اختیاری
- قابلیت بستن خودکار
- ویژگی‌های ARIA مناسب برای دسترسی‌پذیری
- پاکسازی خودکار تایمرها
- طراحی واکنش‌گرا

### نحوه استفاده

```tsx
import { Alert } from 'ndui-ahrom';

// استفاده ساده
<Alert message="این یک هشدار اطلاعاتی است" />

// هشدار موفقیت با بستن خودکار
<Alert 
  type="success"
  message="عملیات با موفقیت انجام شد"
  autoClose={3000}
  onClose={() => console.log('هشدار بسته شد')}
/>

// هشدار اخطار با دکمه بستن
<Alert 
  type="warning"
  message="لطفاً تغییرات خود را بررسی کنید"
  onClose={() => console.log('هشدار بسته شد')}
/>

// هشدار خطا
<Alert
  type="error"
  message="خطایی رخ داده است"
/>
```

### دسترسی‌پذیری

- استفاده از نقش‌ها و ویژگی‌های ARIA مناسب
- آیکون‌ها به درستی از صفحه‌خوان‌ها پنهان شده‌اند
- دکمه بستن دارای برچسب توصیفی است
- پیام‌های هشدار برای صفحه‌خوان‌ها اعلام می‌شوند
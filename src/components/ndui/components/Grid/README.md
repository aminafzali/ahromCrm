# Grid Component

## English

A flexible grid system component with responsive support.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | number \| Object | 12 | Number of columns or breakpoint object |
| gap | number \| string | 4 | Gap between grid items |
| children | ReactNode | - | Grid content |
| className | string | '' | Additional CSS classes |

### Usage

```tsx
import { Grid } from 'ndui-ahrom';

// Basic usage
<Grid columns={3} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Responsive columns
<Grid
  columns={{
    sm: 1,
    md: 2,
    lg: 3
  }}
  gap={4}
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

## فارسی

کامپوننت سیستم گرید با پشتیبانی از طراحی واکنش‌گرا.

### پراپ‌ها

| پراپ | نوع | پیش‌فرض | توضیحات |
|------|------|---------|----------|
| columns | number \| Object | 12 | تعداد ستون‌ها یا آبجکت نقاط شکست |
| gap | number \| string | 4 | فاصله بین آیتم‌های گرید |
| children | ReactNode | - | محتوای گرید |
| className | string | '' | کلاس‌های CSS اضافی |

### نحوه استفاده

```tsx
import { Grid } from 'ndui-ahrom';

// استفاده ساده
<Grid columns={3} gap={4}>
  <div>آیتم ۱</div>
  <div>آیتم ۲</div>
  <div>آیتم ۳</div>
</Grid>

// ستون‌های واکنش‌گرا
<Grid
  columns={{
    sm: 1,
    md: 2,
    lg: 3
  }}
  gap={4}
>
  <div>آیتم ۱</div>
  <div>آیتم ۲</div>
  <div>آیتم ۳</div>
</Grid>
```
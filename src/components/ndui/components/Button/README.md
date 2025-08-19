# Button Component

## English

A flexible button component with various styles, sizes, and states.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'accent' \| 'ghost' \| 'link' | 'primary' | Visual style of the button |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' | 'md' | Size of the button |
| loading | boolean | false | Shows loading state |
| fullWidth | boolean | false | Makes button full width |
| icon | ReactNode | - | Icon to display |
| iconPosition | 'left' \| 'right' | 'left' | Position of the icon |
| ...props | ButtonHTMLAttributes | - | Native button attributes |

### Features

- Multiple variants and sizes
- Loading state support
- Icon support with positioning
- Full width option
- Proper ARIA attributes
- Native button attributes support

### Usage

```tsx
import Button from 'ndui-ahrom';

// Basic usage
<Button>Click me</Button>

// With variant and size
<Button 
  variant="secondary"
  size="lg"
>
  Large Secondary Button
</Button>

// Loading state
<Button loading>
  Saving...
</Button>

// With icon
<Button 
  icon={<span>👋</span>}
  iconPosition="right"
>
  Hello
</Button>

// Full width
<Button fullWidth>
  Full Width Button
</Button>
```

### Accessibility

- Uses native button element
- Proper disabled state handling
- Loading state is announced to screen readers
- Icons are properly hidden from screen readers
- Supports all native button attributes

## فارسی

کامپوننت دکمه انعطاف‌پذیر با سبک‌ها، اندازه‌ها و حالت‌های مختلف.

### پراپ‌ها

| پراپ | نوع | پیش‌فرض | توضیحات |
|------|------|---------|----------|
| variant | 'primary' \| 'secondary' \| 'accent' \| 'ghost' \| 'link' | 'primary' | سبک بصری دکمه |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' | 'md' | اندازه دکمه |
| loading | boolean | false | نمایش حالت بارگذاری |
| fullWidth | boolean | false | دکمه را تمام عرض می‌کند |
| icon | ReactNode | - | آیکون برای نمایش |
| iconPosition | 'left' \| 'right' | 'left' | موقعیت آیکون |
| ...props | ButtonHTMLAttributes | - | ویژگی‌های اصلی دکمه |

### ویژگی‌ها

- انواع و اندازه‌های مختلف
- پشتیبانی از حالت بارگذاری
- پشتیبانی از آیکون با تعیین موقعیت
- گزینه تمام عرض
- ویژگی‌های ARIA مناسب
- پشتیبانی از ویژگی‌های اصلی دکمه

### نحوه استفاده

```tsx
import Button from 'ndui-ahrom';

// استفاده ساده
<Button>کلیک کنید</Button>

// با نوع و اندازه
<Button 
  variant="secondary"
  size="lg"
>
  دکمه ثانویه بزرگ
</Button>

// حالت بارگذاری
<Button loading>
  در حال ذخیره...
</Button>

// با آیکون
<Button 
  icon={<span>👋</span>}
  iconPosition="right"
>
  سلام
</Button>

// تمام عرض
<Button fullWidth>
  دکمه تمام عرض
</Button>
```

### دسترسی‌پذیری

- استفاده از المان اصلی دکمه
- مدیریت صحیح حالت غیرفعال
- اعلام حالت بارگذاری به صفحه‌خوان‌ها
- پنهان کردن صحیح آیکون‌ها از صفحه‌خوان‌ها
- پشتیبانی از تمام ویژگی‌های اصلی دکمه
# Animated Container Component

## English

A container component that adds smooth animations to its children using Framer Motion.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| animation | 'fade' \| 'slide' \| 'scale' | 'fade' | Animation type |
| duration | number | 0.3 | Animation duration in seconds |
| children | ReactNode | - | Content to animate |
| className | string | '' | Additional CSS classes |

### Usage

```tsx
import { AnimatedContainer } from 'ndui-ahrom';

function Example() {
  return (
    <AnimatedContainer
      animation="slide"
      duration={0.5}
    >
      <div>Animated content</div>
    </AnimatedContainer>
  );
}
```

## فارسی

کامپوننت محفظه با انیمیشن‌های نرم با استفاده از Framer Motion.

### پراپ‌ها

| پراپ | نوع | پیش‌فرض | توضیحات |
|------|------|---------|----------|
| animation | 'fade' \| 'slide' \| 'scale' | 'fade' | نوع انیمیشن |
| duration | number | 0.3 | مدت زمان انیمیشن به ثانیه |
| children | ReactNode | - | محتوای انیمیشن‌دار |
| className | string | '' | کلاس‌های CSS اضافی |

### نحوه استفاده

```tsx
import { AnimatedContainer } from 'ndui-ahrom';

function Example() {
  return (
    <AnimatedContainer
      animation="slide"
      duration={0.5}
    >
      <div>محتوای انیمیشن‌دار</div>
    </AnimatedContainer>
  );
}
```
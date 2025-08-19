# Stepper Component

## English

A stepper component for guiding users through a multi-step process or workflow.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| steps | Step[] | - | Array of step configurations |
| activeStep | number | 0 | Current active step index |
| onChange | (step: number) => void | - | Callback when step changes |
| orientation | 'horizontal' \| 'vertical' | 'horizontal' | Layout orientation |
| showNavigation | boolean | true | Show navigation buttons |
| className | string | '' | Additional CSS classes |

### Step Interface

```typescript
interface Step {
  id: string;
  title: string;
  content: ReactNode;
  optional?: boolean;
}
```

### Features

- Horizontal and vertical layouts
- Optional steps
- Progress tracking
- Customizable navigation
- Controlled and uncontrolled modes
- Accessible navigation
- Responsive design

### Usage

```tsx
import { Stepper } from 'ndui-ahrom';

const steps = [
  {
    id: '1',
    title: 'Basic Info',
    content: <BasicInfoForm />
  },
  {
    id: '2',
    title: 'Contact Details',
    content: <ContactForm />,
    optional: true
  },
  {
    id: '3',
    title: 'Review',
    content: <ReviewStep />
  }
];

// Basic usage
<Stepper steps={steps} />

// Vertical orientation
<Stepper
  steps={steps}
  orientation="vertical"
/>

// Controlled stepper
const [activeStep, setActiveStep] = useState(0);

<Stepper
  steps={steps}
  activeStep={activeStep}
  onChange={setActiveStep}
/>
```

## فارسی

کامپوننت گام‌به‌گام برای هدایت کاربران در فرآیندها یا جریان‌های کاری چند مرحله‌ای.

### پراپ‌ها

| پراپ | نوع | پیش‌فرض | توضیحات |
|------|------|---------|----------|
| steps | Step[] | - | آرایه‌ای از تنظیمات گام‌ها |
| activeStep | number | 0 | شاخص گام فعال فعلی |
| onChange | (step: number) => void | - | تابع فراخوانی هنگام تغییر گام |
| orientation | 'horizontal' \| 'vertical' | 'horizontal' | جهت چیدمان |
| showNavigation | boolean | true | نمایش دکمه‌های ناوبری |
| className | string | '' | کلاس‌های CSS اضافی |

### رابط Step

```typescript
interface Step {
  id: string;
  title: string;
  content: ReactNode;
  optional?: boolean;
}
```

### ویژگی‌ها

- چیدمان افقی و عمودی
- گام‌های اختیاری
- پیگیری پیشرفت
- ناوبری قابل سفارشی‌سازی
- حالت‌های کنترل‌شده و کنترل‌نشده
- ناوبری دسترس‌پذیر
- طراحی واکنش‌گرا

### نحوه استفاده

```tsx
import { Stepper } from 'ndui-ahrom';

const steps = [
  {
    id: '1',
    title: 'اطلاعات اولیه',
    content: <BasicInfoForm />
  },
  {
    id: '2',
    title: 'اطلاعات تماس',
    content: <ContactForm />,
    optional: true
  },
  {
    id: '3',
    title: 'بررسی نهایی',
    content: <ReviewStep />
  }
];

// استفاده ساده
<Stepper steps={steps} />

// چیدمان عمودی
<Stepper
  steps={steps}
  orientation="vertical"
/>

// استپر کنترل‌شده
const [activeStep, setActiveStep] = useState(0);

<Stepper
  steps={steps}
  activeStep={activeStep}
  onChange={setActiveStep}
/>
```
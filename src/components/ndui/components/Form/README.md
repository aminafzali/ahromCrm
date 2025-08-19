# Form Component

## English

A form component with built-in validation using React Hook Form and Zod schema validation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| schema | ZodType | - | Zod schema for form validation |
| onSubmit | (data: T) => void | - | Callback when form is submitted |
| children | ReactNode | - | Form content |
| className | string | '' | Additional CSS classes |

### Usage

```tsx
import { Form } from 'ndui-ahrom';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function Example() {
  return (
    <Form
      schema={schema}
      onSubmit={(data) => console.log(data)}
    >
      <Input name="email" label="Email" />
      <Input name="password" type="password" label="Password" />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## فارسی

کامپوننت فرم با اعتبارسنجی داخلی با استفاده از React Hook Form و Zod.

### پراپ‌ها

| پراپ | نوع | پیش‌فرض | توضیحات |
|------|------|---------|----------|
| schema | ZodType | - | طرح Zod برای اعتبارسنجی فرم |
| onSubmit | (data: T) => void | - | تابع فراخوانی هنگام ارسال فرم |
| children | ReactNode | - | محتوای فرم |
| className | string | '' | کلاس‌های CSS اضافی |

### نحوه استفاده

```tsx
import { Form } from 'ndui-ahrom';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function Example() {
  return (
    <Form
      schema={schema}
      onSubmit={(data) => console.log(data)}
    >
      <Input name="email" label="ایمیل" />
      <Input name="password" type="password" label="رمز عبور" />
      <Button type="submit">ارسال</Button>
    </Form>
  );
}
```
# I18n Provider Component

## English

A provider component for internationalization using i18next.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| resources | Object | - | Translation resources |
| defaultLanguage | string | 'en' | Default language |
| children | ReactNode | - | Application content |

### Usage

```tsx
import { I18nProvider } from 'ndui-ahrom';

const translations = {
  en: {
    translation: {
      hello: 'Hello',
      welcome: 'Welcome'
    }
  },
  fa: {
    translation: {
      hello: 'سلام',
      welcome: 'خوش آمدید'
    }
  }
};

function App() {
  return (
    <I18nProvider resources={translations} defaultLanguage="en">
      <YourApp />
    </I18nProvider>
  );
}
```

## فارسی

کامپوننت فراهم‌کننده چندزبانگی با استفاده از i18next.

### پراپ‌ها

| پراپ | نوع | پیش‌فرض | توضیحات |
|------|------|---------|----------|
| resources | Object | - | منابع ترجمه |
| defaultLanguage | string | 'en' | زبان پیش‌فرض |
| children | ReactNode | - | محتوای برنامه |

### نحوه استفاده

```tsx
import { I18nProvider } from 'ndui-ahrom';

const translations = {
  en: {
    translation: {
      hello: 'Hello',
      welcome: 'Welcome'
    }
  },
  fa: {
    translation: {
      hello: 'سلام',
      welcome: 'خوش آمدید'
    }
  }
};

function App() {
  return (
    <I18nProvider resources={translations} defaultLanguage="fa">
      <YourApp />
    </I18nProvider>
  );
}
```
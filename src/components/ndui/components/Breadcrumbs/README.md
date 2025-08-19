# Breadcrumbs Component

A navigation component that helps users understand their current location in a website hierarchy.

## Interfaces

```typescript
interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | BreadcrumbItem[] | - | Array of breadcrumb items |
| separator | ReactNode | '/' | Custom separator between items |
| className | string | '' | Additional CSS classes |

## Usage

```tsx
import { Breadcrumbs } from 'ndui-ahrom';

const items = [
  {
    label: 'Home',
    href: '/',
    icon: '🏠'
  },
  {
    label: 'Products',
    href: '/products',
    icon: '📦'
  },
  {
    label: 'Current Page',
    icon: '📄'
  }
];

// Basic usage
<Breadcrumbs items={items} />

// Custom separator
<Breadcrumbs
  items={items}
  separator=">"
/>

// Custom styling
<Breadcrumbs
  items={items}
  className="text-primary"
/>
```
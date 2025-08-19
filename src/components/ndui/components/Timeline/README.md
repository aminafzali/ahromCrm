# Timeline Component

A timeline component for displaying chronological or sequential content with customizable items.

## Interfaces

```typescript
interface TimelineItem {
  id: string;
  title: string;
  content: React.ReactNode;
  date?: string;
  icon?: React.ReactNode;
  color?: string;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | TimelineItem[] | - | Array of timeline items |
| side | 'left' \| 'right' \| 'alternate' | 'left' | Position of timeline items |

## Usage

```tsx
import { Timeline } from 'ndui-ahrom';

const items = [
  {
    id: '1',
    title: 'Event 1',
    content: 'Description of event 1',
    date: '2023-01-01',
    icon: '🎉',
    color: 'bg-primary'
  },
  {
    id: '2',
    title: 'Event 2',
    content: 'Description of event 2',
    date: '2023-02-01',
    icon: '📅'
  }
];

// Basic usage
<Timeline items={items} />

// Alternate layout
<Timeline
  items={items}
  side="alternate"
/>
```
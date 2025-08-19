# Tabs Component

A flexible tabs component for organizing content into tabbed sections.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | Tab[] | - | Array of tab definitions |
| activeTab | string | - | ID of the initially active tab |
| onChange | (tabId: string) => void | - | Callback when active tab changes |
| variant | 'bordered' \| 'lifted' | 'bordered' | Visual style of the tabs |

### Tab Interface

```typescript
interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}
```

## Usage

```tsx
import { Tabs } from 'ndui-ahrom';

const tabs = [
  {
    id: 'tab1',
    label: 'First Tab',
    content: <p>Content for first tab</p>
  },
  {
    id: 'tab2',
    label: 'Second Tab',
    content: <p>Content for second tab</p>
  }
];

// Basic usage
<Tabs tabs={tabs} />

// With custom variant and onChange
<Tabs
  tabs={tabs}
  variant="lifted"
  onChange={(tabId) => console.log('Active tab:', tabId)}
/>

// With controlled active tab
<Tabs
  tabs={tabs}
  activeTab="tab2"
/>
```
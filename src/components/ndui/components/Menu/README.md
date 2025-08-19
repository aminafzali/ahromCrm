# Menu Component

A dropdown menu component for displaying a list of selectable options with icons and dividers.

## Interfaces

```typescript
interface MenuItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| trigger | ReactNode | - | Element that triggers the menu |
| items | MenuItem[] | - | Array of menu items |
| position | 'bottom' \| 'top' \| 'left' \| 'right' | 'bottom' | Position of the menu |

## Usage

```tsx
import { Menu, Button } from 'ndui-ahrom';

const items = [
  {
    id: '1',
    label: 'Edit',
    icon: '✏️',
    onClick: () => console.log('Edit clicked')
  },
  {
    id: '2',
    label: 'Delete',
    icon: '🗑️',
    onClick: () => console.log('Delete clicked'),
    disabled: true
  },
  { id: '3', divider: true },
  {
    id: '4',
    label: 'Settings',
    icon: '⚙️'
  }
];

// Basic usage
<Menu
  trigger={<Button>Open Menu</Button>}
  items={items}
/>

// Custom position
<Menu
  trigger={<Button>Actions</Button>}
  items={items}
  position="right"
/>
```
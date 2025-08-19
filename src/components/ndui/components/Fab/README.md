# Fab Component

A Floating Action Button (FAB) component for primary actions in your application.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | ReactNode | - | Icon to display in the FAB |
| onClick | () => void | - | Click handler |
| position | 'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left' | 'bottom-right' | Position of the FAB |
| color | 'primary' \| 'secondary' \| 'accent' | 'primary' | Color theme |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of the FAB |
| className | string | '' | Additional CSS classes |

## Usage

```tsx
import { Fab } from 'ndui-ahrom';

// Basic usage
<Fab
  icon="+"
  onClick={() => console.log('FAB clicked')}
/>

// Custom position and color
<Fab
  icon="📝"
  position="top-right"
  color="secondary"
  size="lg"
/>

// Multiple FABs
<>
  <Fab
    icon="+"
    position="bottom-right"
    color="primary"
  />
  <Fab
    icon="🔍"
    position="bottom-left"
    color="secondary"
    size="sm"
  />
</>
```
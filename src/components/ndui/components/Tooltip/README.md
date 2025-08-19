# Tooltip Component

A simple tooltip component for displaying additional information on hover.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| content | string | - | Text to display in the tooltip |
| position | 'top' \| 'bottom' \| 'left' \| 'right' | 'top' | Position of the tooltip |
| children | ReactNode | - | Element that triggers the tooltip |

## Usage

```tsx
import { Tooltip, Button } from 'ndui-ahrom';

// Basic usage
<Tooltip content="This is a tooltip">
  <Button>Hover me</Button>
</Tooltip>

// Custom position
<Tooltip
  content="More information"
  position="right"
>
  <span>ℹ️</span>
</Tooltip>
```
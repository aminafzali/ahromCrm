# Badge Component

A flexible badge component for displaying status indicators, labels, or counts.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'accent' \| 'ghost' \| 'info' \| 'success' \| 'warning' \| 'error' | 'primary' | The visual style of the badge |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' | 'md' | The size of the badge |
| children | ReactNode | - | The content to display inside the badge |
| className | string | '' | Additional CSS classes to apply |

## Usage

```tsx
import { Badge } from 'ndui-ahrom';

// Basic usage
<Badge>Default</Badge>

// Success badge with custom size
<Badge variant="success" size="lg">
  Completed
</Badge>

// Warning badge with custom class
<Badge 
  variant="warning" 
  className="ml-2"
>
  Pending
</Badge>
```
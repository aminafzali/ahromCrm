# Chip Component

A versatile chip component for displaying compact elements like tags, filters, or choices.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | ReactNode | - | Content of the chip |
| onDelete | () => void | - | Callback for delete action |
| icon | ReactNode | - | Icon to display |
| color | 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error' | 'primary' | Color theme |
| variant | 'filled' \| 'outlined' | 'filled' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of the chip |
| className | string | '' | Additional CSS classes |

## Usage

```tsx
import { Chip } from 'ndui-ahrom';

// Basic usage
<Chip label="Basic Chip" />

// With icon and delete
<Chip
  label="React"
  icon="⚛️"
  onDelete={() => console.log('Delete clicked')}
/>

// Different variants
<div className="space-x-2">
  <Chip
    label="Filled"
    color="primary"
    variant="filled"
  />
  <Chip
    label="Outlined"
    color="secondary"
    variant="outlined"
  />
</div>

// Custom styling
<Chip
  label="Custom"
  color="success"
  size="lg"
  className="font-bold"
/>
```
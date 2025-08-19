# Skeleton Component

A skeleton loading component for creating placeholder animations while content is loading.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'text' \| 'rectangle' \| 'circle' | 'text' | Shape of the skeleton |
| width | string \| number | - | Width of the skeleton |
| height | string \| number | - | Height of the skeleton |
| className | string | '' | Additional CSS classes |
| animation | 'pulse' \| 'wave' \| 'none' | 'pulse' | Animation type |

## Usage

```tsx
import { Skeleton } from 'ndui-ahrom';

// Text skeleton
<Skeleton type="text" />

// Circle avatar
<Skeleton
  type="circle"
  width={48}
  height={48}
/>

// Custom rectangle
<Skeleton
  type="rectangle"
  width="100%"
  height={200}
  animation="wave"
/>

// Loading card example
<div className="space-y-4">
  <Skeleton type="text" width="60%" />
  <Skeleton type="text" />
  <Skeleton type="text" />
  <Skeleton
    type="rectangle"
    height={200}
  />
</div>
```
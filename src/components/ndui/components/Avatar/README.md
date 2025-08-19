# Avatar Component

A versatile avatar component for displaying user profile images with fallback support.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | string | - | Image source URL |
| alt | string | '' | Alternative text for the image |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Size of the avatar |
| shape | 'circle' \| 'square' | 'circle' | Shape of the avatar |
| placeholder | ReactNode | - | Custom placeholder when no image |
| className | string | '' | Additional CSS classes |

## Usage

```tsx
import { Avatar } from 'ndui-ahrom';

// Basic usage
<Avatar
  src="https://example.com/avatar.jpg"
  alt="User Name"
/>

// Different sizes and shapes
<div className="flex gap-2">
  <Avatar
    src="user1.jpg"
    size="xs"
  />
  <Avatar
    src="user2.jpg"
    size="lg"
    shape="square"
  />
</div>

// With placeholder
<Avatar
  alt="John Doe"
  placeholder={<span>JD</span>}
  size="xl"
/>
```
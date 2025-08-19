# Input Component

A flexible input component with support for labels, error states, and various styles.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Label text for the input |
| error | string | - | Error message to display |
| variant | 'bordered' \| 'ghost' \| 'primary' | 'bordered' | Visual style of the input |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' | 'md' | Size of the input |
| className | string | '' | Additional CSS classes |
| prepend | ReactNode | - | Content to prepend before the input |
| append | ReactNode | - | Content to append after the input |
| ...props | InputHTMLAttributes<HTMLInputElement> | - | All native input attributes |

## Usage

```tsx
import Input from 'ndui-ahrom';

// Basic usage
<Input
  label="Username"
  placeholder="Enter username"
/>

// With error state
<Input
  label="Email"
  type="email"
  error="Please enter a valid email"
/>

// Custom variant and size
<Input
  label="Search"
  variant="ghost"
  size="lg"
  placeholder="Search..."
/>

// With prepend and append
<Input
  label="Price"
  prepend="$"
  append=".00"
  placeholder="0"
/>

// With component prepend/append
<Input
  label="Search"
  append={<button className="btn btn-primary">Search</button>}
  placeholder="Search..."
/>
```
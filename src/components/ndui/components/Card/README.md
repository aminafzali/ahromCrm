# Card Component

A versatile card component for displaying content with optional title and footer sections.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | ReactNode | - | Optional title content for the card |
| children | ReactNode | - | Main content of the card |
| footer | ReactNode | - | Optional footer content |
| className | string | '' | Additional CSS classes to apply |

## Usage

```tsx
import { Card, Button } from 'ndui-ahrom';

// Basic usage
<Card>
  <p>Simple card content</p>
</Card>

// Card with title and footer
<Card
  title="Card Title"
  footer={<Button>Action</Button>}
>
  <p>Card content with title and footer</p>
</Card>

// Custom styled card
<Card className="w-96 mx-auto">
  <p>Custom width card</p>
</Card>
```
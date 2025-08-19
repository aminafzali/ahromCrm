# Toolbar Component

A flexible toolbar component for creating application headers, navigation bars, and action bars.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Content to be displayed in the toolbar |
| className | string | '' | Additional CSS classes |
| elevated | boolean | false | Adds shadow to create an elevated effect |

## Usage

```tsx
import { Toolbar, Button } from 'ndui-ahrom';

// Basic usage
<Toolbar>
  <h1 className="text-xl font-bold">App Title</h1>
</Toolbar>

// With navigation and actions
<Toolbar elevated>
  <div className="flex-1">
    <h1 className="text-xl">Dashboard</h1>
  </div>
  <div className="flex gap-2">
    <Button>Settings</Button>
    <Button>Profile</Button>
  </div>
</Toolbar>

// Custom styling
<Toolbar className="bg-primary text-primary-content">
  <h1>Custom Toolbar</h1>
</Toolbar>
```
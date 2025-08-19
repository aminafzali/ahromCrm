# Drawer Component

A versatile drawer component inspired by Quasar Framework's drawer implementation.

## Features

- Multiple positions (left, right, top, bottom)
- Resizable
- Mini mode
- Responsive behavior
- Fixed or absolute positioning
- Overlay backdrop
- Persistent mode
- Elevation and border options
- Smooth animations

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | boolean | - | Controls the visibility of the drawer |
| onClose | () => void | - | Callback function when drawer is closed |
| children | ReactNode | - | Content to be displayed inside the drawer |
| side | 'left' \| 'right' \| 'top' \| 'bottom' | 'left' | Position of the drawer |
| size | string | '300px' | Width/height of the drawer |
| overlay | boolean | true | Show overlay behind drawer |
| elevated | boolean | false | Add elevation shadow |
| fixed | boolean | false | Use fixed positioning |
| bordered | boolean | false | Add border |
| mini | boolean | false | Enable mini mode |
| miniWidth | string | '60px' | Width of mini drawer |
| persistent | boolean | false | Prevent closing on outside click |
| className | string | '' | Additional CSS classes |
| behavior | 'default' \| 'desktop' \| 'mobile' | 'default' | Responsive behavior |
| breakpoint | number | 1024 | Breakpoint for responsive behavior |
| resizable | boolean | false | Enable resize handle |
| minSize | string | '200px' | Minimum size when resizing |
| maxSize | string | '600px' | Maximum size when resizing |

## Usage

```tsx
import { Drawer, Button } from 'ndui-ahrom';

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Drawer
      </Button>

      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        side="left"
        size="300px"
      >
        <div className="p-4">
          <h2 className="text-xl font-bold">Drawer Content</h2>
          <p>This is the drawer content.</p>
        </div>
      </Drawer>
    </>
  );
}

// Resizable drawer
<Drawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  resizable
  minSize="200px"
  maxSize="500px"
>
  <div className="p-4">
    <h2>Resizable Drawer</h2>
    <p>Drag the edge to resize</p>
  </div>
</Drawer>

// Mini drawer
<Drawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  mini
  miniWidth="60px"
>
  <div className="p-4">
    <h2>Mini Drawer</h2>
  </div>
</Drawer>

// Responsive drawer
<Drawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  behavior="desktop"
  breakpoint={768}
>
  <div className="p-4">
    <h2>Desktop Only Drawer</h2>
  </div>
</Drawer>
```

## Accessibility

- Proper focus management
- ARIA attributes for overlay and drawer
- Keyboard navigation support
- Screen reader friendly

## Best Practices

1. Use appropriate `side` based on your app's layout
2. Consider using `persistent` for main navigation drawers
3. Use `behavior` for responsive layouts
4. Set appropriate `minSize` and `maxSize` when using `resizable`
5. Use `mini` mode for space-efficient navigation
6. Consider `fixed` positioning for full-height layouts
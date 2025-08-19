| showActiveHighlight | boolean | true | Show highlight for active item |
| activeColor | 'primary' \| 'secondary' \| 'accent' | 'primary' | Color theme for active item |
| animated | boolean | true | Enable animations |
| isVisible | boolean | true | Control visibility |
| height | string | '56px' | Height of the bar |

### BottomBarItem Interface

```typescript
interface BottomBarItem {
  icon: ReactNode;
  label: string;
  value: string;
  badge?: number | string;
  href?: string;
}
```

## Usage

```tsx
import { BottomBar } from 'ndui-ahrom';

const items = [
  {
    icon: '🏠',
    label: 'Home',
    value: 'home',
    href: '/'
  },
  {
    icon: '🔍',
    label: 'Search',
    value: 'search',
    href: '/search'
  },
  {
    icon: '❤️',
    label: 'Favorites',
    value: 'favorites',
    href: '/favorites',
    badge: 3
  },
  {
    icon: '👤',
    label: 'Profile',
    value: 'profile',
    href: '/profile'
  }
];

// Basic usage with navigation
<BottomBar items={items} />

// With active state and onChange
function Example() {
  const [active, setActive] = useState('home');
  
  return (
    <BottomBar
      items={items}
      value={active}
      onChange={setActive}
    />
  );
}

// Custom styling
<BottomBar
  items={items}
  activeColor="secondary"
  elevated={false}
  bordered
/>
```

## Best Practices

1. Use meaningful icons that represent the destination
2. Keep labels short and descriptive
3. Use badges sparingly
4. Ensure consistent navigation structure
5. Provide visual feedback for active state
6. Consider using Next.js Link for client-side navigation
7. Handle both href and onClick navigation patterns
8. Maintain accessibility with proper ARIA attributes
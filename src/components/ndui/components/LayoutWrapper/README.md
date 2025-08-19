# LayoutWrapper Component

A comprehensive layout wrapper component that combines Drawer, BottomBar, and Toolbar components, inspired by Quasar's layout system.

## Features

- Responsive drawer with desktop and mobile modes
- Mini drawer support
- Configurable toolbar with elevation
- Mobile bottom navigation bar
- Flexible content areas
- Next.js App Router compatible

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Main content of the layout |
| drawerContent | ReactNode | - | Content for the left drawer |
| showDrawer | boolean | true | Whether to show the drawer |
| miniDrawer | boolean | false | Whether the drawer is in mini mode |
| drawerWidth | string | '280px' | Width of the drawer |
| miniDrawerWidth | string | '60px' | Width of mini drawer |
| toolbarContent | ReactNode | - | Content for the toolbar |
| showToolbar | boolean | true | Whether to show the toolbar |
| elevatedToolbar | boolean | true | Whether the toolbar is elevated |
| bottomBarItems | BottomBarItem[] | - | Items for the bottom bar |
| showBottomBar | boolean | true | Whether to show the bottom bar |
| bottomBarValue | string | - | Currently selected bottom bar item |
| onBottomBarChange | (value: string) => void | - | Callback when bottom bar item is selected |
| className | string | '' | Additional CSS classes |

## Usage with App Router

```tsx
// app/layout.tsx
import { LayoutWrapper } from 'ndui-ahrom';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const drawerContent = (
    <div className="p-4">
      <h2 className="text-xl font-bold">Navigation</h2>
      {/* Add your navigation links here */}
    </div>
  );

  const toolbarContent = (
    <>
      <h1 className="text-xl font-bold ml-4">My App</h1>
      <div className="flex-1" />
      {/* Add your toolbar actions here */}
    </>
  );

  const bottomBarItems = [
    {
      icon: '🏠',
      label: 'Home',
      value: 'home'
    },
    {
      icon: '📝',
      label: 'Notes',
      value: 'notes'
    },
    {
      icon: '⚙️',
      label: 'Settings',
      value: 'settings'
    }
  ];

  return (
    <html lang="en">
      <body>
        <LayoutWrapper
          drawerContent={drawerContent}
          toolbarContent={toolbarContent}
          bottomBarItems={bottomBarItems}
          showDrawer
          showToolbar
          showBottomBar
        >
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}

// app/page.tsx
export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      {/* Your page content */}
    </div>
  );
}
```

## Responsive Behavior

- Desktop:
  - Full drawer visible by default
  - Toggle button to collapse/expand drawer
  - No bottom bar

- Mobile:
  - Drawer hidden by default, shown via menu button
  - Full-screen drawer with overlay
  - Bottom bar visible for navigation

## Customization

- Use `className` to add custom styles
- Adjust drawer and toolbar visibility
- Configure drawer widths
- Customize toolbar elevation
- Toggle bottom bar visibility

## Best Practices

1. Place layout wrapper in `app/layout.tsx` for consistent layout across pages
2. Use drawer for main navigation
3. Keep toolbar content minimal on mobile
4. Use bottom bar for primary mobile navigation
5. Consider mini drawer for space efficiency
6. Ensure responsive content padding
7. Add "use client" directive when using client components in the layout
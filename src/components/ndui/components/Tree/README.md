# Tree Component

A hierarchical tree component for displaying nested data structures with expandable nodes.

## Interfaces

```typescript
interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| nodes | TreeNode[] | - | Array of tree nodes |
| onNodeClick | (node: TreeNode) => void | - | Callback when a node is clicked |
| defaultExpanded | string[] | [] | Array of node IDs that should be expanded by default |

## Usage

```tsx
import { Tree } from 'ndui-ahrom';

const nodes = [
  {
    id: '1',
    label: 'Root',
    children: [
      {
        id: '1.1',
        label: 'Child 1',
        icon: '📁',
        children: [
          { id: '1.1.1', label: 'Grandchild', icon: '📄' }
        ]
      },
      { id: '1.2', label: 'Child 2', icon: '📁' }
    ]
  }
];

// Basic usage
<Tree nodes={nodes} />

// With click handler and default expanded nodes
<Tree
  nodes={nodes}
  onNodeClick={(node) => console.log('Clicked:', node.label)}
  defaultExpanded={['1', '1.1']}
/>
```
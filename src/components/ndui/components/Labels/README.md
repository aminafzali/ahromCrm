# Labels Component

A flexible component for managing labels/tags with support for selection, search, and adding new labels.

## Features

- Multiple label selection
- Search functionality
- Add new labels
- Remove existing labels
- Animated dropdown
- Fully customizable

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| labels | Label[] | - | Array of available labels |
| selectedLabels | string[] | [] | Array of selected label IDs |
| onLabelsChange | (labelIds: string[]) => void | - | Callback when selection changes |
| onAddLabel | (label: Label) => void | - | Callback when new label is added |
| onRemoveLabel | (labelId: string) => void | - | Callback when label is removed |
| className | string | '' | Additional CSS classes |
| placeholder | string | 'Add to label' | Placeholder text |
| addNewLabel | boolean | true | Enable adding new labels |
| searchable | boolean | true | Enable search functionality |

### Label Interface

```typescript
interface Label {
  id: string;
  name: string;
}
```

## Usage

```tsx
import { Labels } from 'ndui-ahrom';

// Basic usage
const labels = [
  { id: '1', name: 'Important' },
  { id: '2', name: 'Work' },
  { id: '3', name: 'Personal' }
];

function Example() {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  return (
    <Labels
      labels={labels}
      selectedLabels={selectedLabels}
      onLabelsChange={setSelectedLabels}
    />
  );
}

// With all features
function FullExample() {
  const [labels, setLabels] = useState([
    { id: '1', name: 'Important' },
    { id: '2', name: 'Work' }
  ]);
  const [selected, setSelected] = useState<string[]>([]);

  const handleAddLabel = (newLabel: Label) => {
    setLabels([...labels, newLabel]);
  };

  const handleRemoveLabel = (labelId: string) => {
    setLabels(labels.filter(label => label.id !== labelId));
    setSelected(selected.filter(id => id !== labelId));
  };

  return (
    <Labels
      labels={labels}
      selectedLabels={selected}
      onLabelsChange={setSelected}
      onAddLabel={handleAddLabel}
      onRemoveLabel={handleRemoveLabel}
      placeholder="Add labels"
      addNewLabel
      searchable
    />
  );
}
```

## Styling

The component uses DaisyUI classes and can be customized using:

- className prop for container styling
- DaisyUI theme customization
- Tailwind CSS classes

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly
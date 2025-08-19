# Select Component

A customizable select component with support for labels, options, error states, and multiselect with chips.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Label text for the select |
| options | Option[] | - | Array of options to display |
| name | string | - | Field name for form control |
| error | string | - | Error message to display |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' | 'md' | Size of the select |
| className | string | '' | Additional CSS classes |
| isMulti | boolean | false | Enable multiselect with chips |
| renderOption | (option: Option) => ReactNode | - | Custom option renderer |
| renderChip | (option: Option) => ReactNode | - | Custom chip renderer |
| onChipDelete | (option: Option) => void | - | Callback when a chip is deleted |
| ...props | SelectHTMLAttributes | - | All native select attributes |

### Option Interface

```typescript
interface Option {
  value: string;
  label: string;
  [key: string]: any; // Additional properties for custom rendering
}
```

## Usage

```tsx
import { Select } from 'ndui-ahrom';

const options = [
  { value: '1', label: 'Option 1', icon: '🌟' },
  { value: '2', label: 'Option 2', icon: '💫' },
  { value: '3', label: 'Option 3', icon: '⭐' }
];

// Basic usage
<Select
  label="Choose an option"
  name="basicSelect"
  options={options}
/>

// Multiselect with chips
<Select
  label="Select multiple"
  name="multiSelect"
  options={options}
  isMulti
/>

// Custom option rendering
<Select
  label="Custom options"
  name="customSelect"
  options={options}
  renderOption={(option) => (
    <div className="flex items-center gap-2">
      <span>{option.icon}</span>
      <span>{option.label}</span>
    </div>
  )}
/>

// Custom chip rendering
<Select
  label="Custom chips"
  name="customChips"
  options={options}
  isMulti
  renderChip={(option) => (
    <div className="flex items-center gap-1">
      {option.icon}
      {option.label}
    </div>
  )}
  onChipDelete={(option) => console.log('Deleted:', option)}
/>
```
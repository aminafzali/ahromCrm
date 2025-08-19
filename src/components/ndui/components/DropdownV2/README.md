# Dropdown Component

A flexible dropdown/select component with single and multi-select capabilities, form integration, and customizable styling.

## Features

- Single and multi-select support
- Form integration with React Hook Form
- Searchable options
- Custom styling and theming
- Loading state
- Error handling
- Custom option and value rendering
- Chips for multi-select values
- Icon support for options

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | - | Field name for form integration |
| options | Option[] | - | Array of options |
| label | string | - | Label text |
| placeholder | string | 'انتخاب کنید...' | Placeholder text |
| isMulti | boolean | false | Enable multi-select |
| isSearchable | boolean | true | Enable search functionality |
| isClearable | boolean | true | Show clear button |
| isLoading | boolean | false | Show loading state |
| error | string | - | Error message |
| className | string | '' | Additional CSS classes |
| onChange | (value: any) => void | - | Change callback |
| onInputChange | (value: string) => void | - | Input change callback |
| customStyles | object | - | Custom styles object |
| isDisabled | boolean | false | Disable the dropdown |
| menuPlacement | 'auto' \| 'bottom' \| 'top' | 'auto' | Menu placement |

### Option Interface

```typescript
interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}
```

## Usage

```tsx
import { Dropdown } from 'ndui-ahrom';
import { useForm, FormProvider } from 'react-hook-form';

// Basic single select
const options = [
  { value: '1', label: 'Option 1', icon: '🌟' },
  { value: '2', label: 'Option 2', icon: '💫' },
  { value: '3', label: 'Option 3', icon: '⭐' }
];

function Example() {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Dropdown
          name="singleSelect"
          label="Choose an option"
          options={options}
        />
      </form>
    </FormProvider>
  );
}

// Multi-select with validation
function MultiSelectExample() {
  const methods = useForm({
    defaultValues: {
      multiSelect: []
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Dropdown
          name="multiSelect"
          label="Select multiple options"
          options={options}
          isMulti
          error={methods.formState.errors.multiSelect?.message}
        />
      </form>
    </FormProvider>
  );
}

// With loading state and custom placeholder
<Dropdown
  name="loadingSelect"
  label="Loading example"
  options={options}
  isLoading
  placeholder="Loading options..."
/>

// Disabled state
<Dropdown
  name="disabledSelect"
  label="Disabled example"
  options={options}
  isDisabled
/>

// With custom menu placement
<Dropdown
  name="topMenu"
  label="Menu on top"
  options={options}
  menuPlacement="top"
/>
```

## Styling

The component uses DaisyUI classes for styling and can be customized using:

1. className prop for container styling
2. customStyles prop for detailed React-Select styling
3. Built-in class modifiers for states (error, focus, disabled)

## Form Integration

The component is designed to work seamlessly with React Hook Form:

1. Automatically registers with the form
2. Handles form value updates
3. Displays error states
4. Supports validation
5. Maintains form state

## Accessibility

- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader friendly
# ButtonSelectWithTable Component

A button component that opens a modal with a table for item selection.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | Column[] | - | Table columns configuration |
| data | any[] | - | Table data |
| onSelect | (selectedItem: any) => void | - | Callback when item is selected |
| modalTitle | string | 'Select Item' | Modal title |
| ...buttonProps | ButtonProps | - | All props from Button component |

## Usage

```tsx
import { ButtonSelectWithTable } from 'ndui-ahrom';

function Example() {
  const columns = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'Name' },
    { name: 'email', label: 'Email' }
  ];

  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  return (
    <ButtonSelectWithTable
      columns={columns}
      data={data}
      onSelect={(selectedItem) => console.log('Selected:', selectedItem)}
      variant="primary"
    >
      Select User
    </ButtonSelectWithTable>
  );
}
```
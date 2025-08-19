# ButtonCreate Component

A button component that opens a modal with custom content and approve/cancel actions.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modalTitle | string | 'Create' | Modal title |
| modalContent | ReactNode | - | Content to display in modal |
| approveText | string | 'Create' | Text for approve button |
| cancelText | string | 'Cancel' | Text for cancel button |
| onApprove | () => void \| Promise<void> | - | Function called on approve |
| ...buttonProps | ButtonProps | - | All props from Button component |

## Usage

```tsx
import { ButtonCreate } from 'ndui-ahrom';

function Example() {
  const handleCreate = async () => {
    // Your create logic here
    await saveItem();
  };

  return (
    <ButtonCreate
      modalTitle="Create New Item"
      modalContent={<div>Your form or content here</div>}
      approveText="Save"
      cancelText="Cancel"
      onApprove={handleCreate}
      variant="primary"
    >
      Create Item
    </ButtonCreate>
  );
}
```
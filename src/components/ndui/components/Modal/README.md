# Modal Component

A modal dialog component with customizable content, title, and footer sections.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | boolean | - | Controls the visibility of the modal |
| onClose | () => void | - | Callback function when modal is closed |
| title | ReactNode | - | Optional title content |
| children | ReactNode | - | Main content of the modal |
| footer | ReactNode | - | Optional footer content |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of the modal |

## Usage

```tsx
import { Modal, Button } from 'ndui-ahrom';

function Example() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        footer={
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        }
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```
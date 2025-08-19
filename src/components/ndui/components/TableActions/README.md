# TableActions Component

A comprehensive component for handling row actions in tables with support for view, edit, delete, and custom operations.

## Features

- Supports multiple action combinations (view, edit, delete)
- Custom action support for extending functionality
- Customizable icons and labels
- Confirmation dialog for delete and custom actions
- Tooltip support for better UX
- Accessible with proper ARIA attributes
- Flexible layout options (row or column)
- Supports both icon-only and text+icon modes

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| actions | ActionType[] | - | Array of action types to display ('view', 'edit', 'delete', or custom IDs) |
| row | any | - | Row data to pass to action handlers |
| onView | (row: any) => void | - | Callback for view action |
| onEdit | (row: any) => void | - | Callback for edit action |
| onDelete | (row: any) => void | - | Callback for delete action |
| showLabels | boolean | false | Whether to show text labels alongside icons |
| size | 'xs' \| 'sm' \| 'md' | 'sm' | Size of action buttons |
| className | string | '' | Custom class name |
| labels | object | - | Custom labels for actions |
| icons | object | - | Custom icons for actions |
| confirmDelete | boolean | true | Whether to show confirmation dialog for delete action |
| direction | 'row' \| 'column' | 'row' | Direction of action buttons |
| customActions | CustomAction[] | [] | Array of custom actions to display |

## CustomAction Interface

```typescript
interface CustomAction {
  id: string;              // Unique identifier for the custom action
  label: string;           // Display label for the custom action
  icon: React.ReactNode;   // Icon to display for the custom action
  onClick: (row: any) => void; // Handler function for the custom action
  className?: string;      // CSS class for styling the custom action
  confirmAction?: boolean; // Whether to show confirmation dialog
  confirmTitle?: string;   // Confirmation dialog title
  confirmMessage?: string; // Confirmation dialog message
  confirmLabel?: string;   // Confirm button label
  cancelLabel?: string;    // Cancel button label
}
```

## Usage

```tsx
import { TableActions } from 'ndui-ahrom';
import { Table } from 'ndui-ahrom';

// Define your columns with actions
const columns = [
  { name: 'name', field: 'name', label: 'Name' },
  { name: 'email', field: 'email', label: 'Email' },
  {
    name: 'actions',
    label: 'Actions',
    render: (row) => (
      <TableActions
        actions={['view', 'edit', 'delete']}
        row={row}
        onView={(row) => handleView(row)}
        onEdit={(row) => handleEdit(row)}
        onDelete={(row) => handleDelete(row)}
      />
    )
  }
];

// Example usage with different action combinations
function renderActions(row) {
  // View only
  return (
    <TableActions
      actions={['view']}
      row={row}
      onView={handleView}
    />
  );
  
  // View + Edit
  return (
    <TableActions
      actions={['view', 'edit']}
      row={row}
      onView={handleView}
      onEdit={handleEdit}
    />
  );
  
  // View + Edit + Delete
  return (
    <TableActions
      actions={['view', 'edit', 'delete']}
      row={row}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
  
  // View + Delete
  return (
    <TableActions
      actions={['view', 'delete']}
      row={row}
      onView={handleView}
      onDelete={handleDelete}
    />
  );
  
  // Edit + Delete
  return (
    <TableActions
      actions={['edit', 'delete']}
      row={row}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

// With custom actions
const customActions = [
  {
    id: 'approve',
    label: 'Approve',
    icon: <span>✓</span>,
    onClick: (row) => handleApprove(row),
    className: 'text-success',
    confirmAction: true,
    confirmTitle: 'Confirm Approval',
    confirmMessage: 'Are you sure you want to approve this item?'
  },
  {
    id: 'reject',
    label: 'Reject',
    icon: <span>✗</span>,
    onClick: (row) => handleReject(row),
    className: 'text-error',
    confirmAction: true
  },
  {
    id: 'download',
    label: 'Download',
    icon: <span>↓</span>,
    onClick: (row) => handleDownload(row),
    className: 'text-info'
  }
];

// Using custom actions
<TableActions
  actions={['view', 'edit', 'approve', 'reject']}
  row={row}
  onView={handleView}
  onEdit={handleEdit}
  customActions={customActions}
/>
```

## Custom Styling and Labels

```tsx
<TableActions
  actions={['view', 'edit', 'delete', 'download']}
  row={row}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  showLabels={true}
  size="xs"
  direction="column"
  labels={{
    view: "View Details",
    edit: "Edit Item",
    delete: "Remove",
    deleteTitle: "Confirm Removal",
    deleteMessage: "Are you sure you want to remove this item? This action cannot be undone."
  }}
  customActions={[
    {
      id: 'download',
      label: 'Download',
      icon: <span>↓</span>,
      onClick: (row) => handleDownload(row)
    }
  ]}
/>
```

## Accessibility

- Buttons have appropriate ARIA labels
- Delete and custom actions can have confirmation dialogs
- Tooltips provide additional context for icon-only buttons
- Focus management for modal dialogs

## Best Practices

1. Use consistent action sets across similar tables
2. Consider using showLabels for mobile views
3. Customize confirmation messages for specific content types
4. Use appropriate colors for different actions (info, warning, error)
5. Consider adding permission checks before rendering certain actions
6. Group related actions together
7. Use meaningful icons that clearly represent the action
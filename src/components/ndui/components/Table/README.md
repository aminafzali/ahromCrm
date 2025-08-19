# Table Component

A comprehensive table component with sorting, pagination, row selection, custom rendering, and responsive view modes (table, card, and list).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | Column[] | - | Array of column definitions |
| data | any[] | - | Array of data to display |
| title | string | - | Optional table title |
| loading | boolean | false | Loading state of the table |
| selection | 'single' \| 'multiple' \| 'none' | 'none' | Row selection mode |
| onSelectionChange | (selected: any[]) => void | - | Callback when selection changes |
| pagination | { total: number; pages: number; page: number; limit: number; } | - | Pagination configuration |
| onPageChange | (page: number) => void | - | Callback when page changes |
| onLimitChange | (limit: number) => void | - | Callback when rows per page changes |
| rowsPerPageOptions | number[] | [5, 10, 20, 50] | Available page size options |
| onRowClick | (row: any, index: number) => void | - | Callback when row is clicked |
| noDataMessage | string | 'No data available' | Message shown when no data |
| loadingMessage | string | 'Loading...' | Message shown when loading |
| defaultViewMode | 'table' \| 'card' \| 'list' | 'table' | Default view mode |
| listItemHeight | string | 'auto' | Height of list items in list view |
| listItemClassName | string | '' | Additional CSS classes for list items |
| listItemRender | (row: any, columns: Column[]) => ReactNode | - | Custom renderer for list items |

### Column Interface

```typescript
interface Column {
  name: string;
  field?: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  format?: (value: any) => React.ReactNode;
  render?: (row: any) => React.ReactNode;
  style?: React.CSSProperties;
  width?: number | string;
}
```

## Usage

```tsx
import { Table, Button } from 'ndui-ahrom';
import Link from 'next/link';
import { useState } from 'react';

// Basic usage with custom rendering and external pagination
function ExampleTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // This would typically come from an API call
  const paginationData = {
    total: 100,
    pages: 10,
    page: page,
    limit: limit
  };
  
  const columns = [
    {
      name: "customer", 
      field: "request.user.name", 
      label: "نام مخاطب",
      render: (row) => row.request.user.name || "نامشخص"
    },
    {
      name: "status",
      field: "status",
      label: "Status",
      sortable: true
    },
    { 
      name: "actions", 
      label: "عملیات", 
      render: (row) => (
        <Link href={`/dashboard/invoices/${row.id}`}>
          <Button size="sm" variant="ghost">مشاهده</Button>
        </Link>
      )
    }
  ];

  const data = [
    { id: 1, request: { user: { name: 'John Doe' } }, status: 'Active' },
    { id: 2, request: { user: { name: 'Jane Smith' } }, status: 'Pending' }
  ];
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Here you would typically fetch new data for the page
    // fetchData(newPage, limit);
  };
  
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
    // fetchData(1, newLimit);
  };

  return (
    <Table
      columns={columns}
      data={data}
      title="Invoices"
      pagination={paginationData}
      onPageChange={handlePageChange}
      onLimitChange={handleLimitChange}
    />
  );
}

// With selection and list view
<Table
  columns={columns}
  data={data}
  title="Users"
  selection="multiple"
  onSelectionChange={(selected) => console.log('Selected:', selected)}
  pagination={paginationData}
  onPageChange={handlePageChange}
  onLimitChange={handleLimitChange}
  defaultViewMode="list"
/>

// With custom list item renderer
<Table
  columns={columns}
  data={data}
  defaultViewMode="list"
  listItemRender={(row, columns) => (
    <div className="flex flex-col">
      <h3 className="text-lg font-bold">{row.request.user.name}</h3>
      <div className="flex justify-between mt-2">
        <span className="badge badge-primary">{row.status}</span>
        <Button size="sm" onClick={() => handleView(row)}>View Details</Button>
      </div>
    </div>
  )}
/>
```

## View Modes

### Table View
The traditional tabular layout with rows and columns.

### Card View
Each row is displayed as a card, with column labels and values stacked vertically. Useful for mobile views and when displaying complex data.

### List View
A compact list format that displays each row as a list item. Provides a middle ground between the dense table view and the spacious card view.

## Features

### Custom Column Rendering

You can use the `render` prop in a column definition to completely customize how a cell is rendered:

```tsx
{
  name: "actions",
  label: "Actions",
  render: (row) => (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => handleEdit(row)}>Edit</Button>
      <Button size="sm" variant="error" onClick={() => handleDelete(row)}>Delete</Button>
    </div>
  )
}
```

### Custom List Item Rendering

For list view, you can completely customize how each item is rendered:

```tsx
listItemRender={(row, columns) => (
  <div className="flex justify-between items-center">
    <div>
      <h3 className="font-bold">{row.name}</h3>
      <p className="text-sm text-gray-500">{row.email}</p>
    </div>
    <Button>View</Button>
  </div>
)}
```

### Nested Data Access

You can access nested properties using dot notation in the `field` prop:

```tsx
{
  name: "customerName",
  field: "order.customer.name",
  label: "Customer Name"
}
```

### External Pagination

The table supports external pagination, allowing you to:

1. Control pagination state from outside the component
2. Handle page changes via callbacks
3. Implement server-side pagination efficiently
4. Display accurate pagination information based on total records

### Advanced Features

- Column resizing
- Sorting
- Filtering
- Row selection (single/multiple)
- Expandable rows
- Loading states
- Multiple view modes (table, card, list)
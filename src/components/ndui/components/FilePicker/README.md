# FilePicker Component

A customizable file input component with support for multiple files, file type restrictions, and size limits.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onChange | (files: FileList \| null) => void | - | Callback when files are selected |
| accept | string | - | Accepted file types (e.g., "image/*") |
| multiple | boolean | false | Allow multiple file selection |
| maxSize | number | - | Maximum file size in bytes |
| label | string | - | Label text for the input |
| error | string | - | Error message to display |
| className | string | '' | Additional CSS classes |

## Usage

```tsx
import { FilePicker } from 'ndui-ahrom';

// Basic usage
<FilePicker
  label="Upload File"
  onChange={(files) => console.log('Files:', files)}
/>

// Image upload with restrictions
<FilePicker
  label="Upload Images"
  accept="image/*"
  multiple
  maxSize={5 * 1024 * 1024} // 5MB
  onChange={(files) => handleImageUpload(files)}
  error="Please select images under 5MB"
/>
```
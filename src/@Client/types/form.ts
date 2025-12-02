import { Column } from "ndui-ahrom/dist/components/Table/Table";
import { z } from "zod";

export interface Option {
  value: string;
  label: string;
  [key: string]: any; // Allow additional properties for custom rendering
}

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "tel"
  | "textarea"
  | "select"
  | "date"
  | "time"
  | "checkbox"
  | "dropdown"
  | "radio"
  | "dataTable"
  | "color"
  | "switch"
  | "multiSelect"
  | "custom";

export interface FormField {
  showName?: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: Option[]; // For select, radio, etc.
  columns?: Column[]; // For select, radio, etc.
  data?: any[]; // For select, radio, etc.
  defaultSelected?: any[];
  validation?: z.ZodType<any>;
  defaultValue?: any;
  tableProps?: any;
  className?: string;
  col?: 1 | 2 | 3 | 4; // For grid layout
  disabled?: boolean;
  multiple?: boolean;
  hidden?: boolean;
  append?: React.ReactNode;
  prepend?: React.ReactNode;
  renderOption?: (option: Option) => React.ReactNode;
  onChange?: (value: any) => void;
  onCreateOption?: (value: any) => void;
  render?: (
    field: FormField,
    value: any,
    onChange: (value: any) => void
  ) => React.ReactNode; // For custom fields
}

export interface FormConfig {
  fields: FormField[];
  validation: z.ZodType<any>;
  layout?: {
    columns?: 1 | 2 | 3 | 4;
    gap?: number;
  };
}

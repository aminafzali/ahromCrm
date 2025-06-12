import { Field, Form as PrismaForm } from "@prisma/client";

export interface FormField {
  key: string;
  label: string;
  type: string;
  input: boolean;
  required?: boolean;
  validate?: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  multiple?: boolean;
  values?: FormFieldOption[];
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormDefinition {
  name: string;
  description?: string;
  display: string;
  type: string;
  components: FormField[];
  isActive: boolean;
}

type FieldOnForm = {
  field: Field
}
export type FormWithRelations = PrismaForm & {
  submissions?: FormSubmission[];
  fields: FieldOnForm[]
};

export interface FormSubmission {
  id: number;
  formId: number;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
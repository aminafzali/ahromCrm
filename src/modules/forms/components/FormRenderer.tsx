import { Field as FormField } from "@prisma/client";
import { Button, Form, Input, Select } from "ndui-ahrom";
import { useState } from "react";
import generateSchema from "./generateSchema";

interface FormRendererProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export default function FormRenderer({
  fields,
  onSubmit,
  initialValues = {},
}: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = generateSchema(fields);

  const handleSubmit = (data: any) => {
    console.log(data);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "select":
        return (
          <Select
            name={field.name}
            label={field.label}
            options={[]}
            required={field.required}
          />
        );
      case "text":
        return (
          <Input
            name={field.name}
            label={field.label}
            placeholder={field.placeholder || ""}
            required={field.required}
            type="textarea"
          />
        );
      case "boolean":
        return (
          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="label-text">{field.label}</span>
              <input type="checkbox" className="checkbox" />
            </label>
          </div>
        );
      default:
        return (
          <Input
            type={field.type}
            name={field.name}
            label={field.label}
            placeholder={field.placeholder || ""}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="p-2 bg-white rounded">
      <Form schema={schema} onSubmit={handleSubmit}>
        <div className="flex justify-end">
          <Button type="submit">ثبت</Button>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {fields.map((field, index) => (
            <div key={index}>{renderField(field)}</div>
          ))}
        </div>
      </Form>
    </div>
  );
}

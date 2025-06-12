import { z } from "zod";

const generateSchema = (fields) => {
  const shape = {};
//   const formFieldSchema2 = z.object({ });
//   formFieldSchema2.
  fields.forEach((field) => {
    let fieldSchema;

    switch (field.type) {
      case "text":
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = fieldSchema.min(1, "این فیلد اجباری است");
        }
        break;
      case "number":
        fieldSchema = z.number();
        if (field.required) {
          fieldSchema = fieldSchema.min(1, "عدد معتبر وارد کنید");
        }
        break;
      case "email":
        fieldSchema = z.string().email("ایمیل معتبر وارد کنید");
        if (field.required) {
          fieldSchema = fieldSchema.min(1, "ایمیل اجباری است");
        }
        break;
      case "select":
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = fieldSchema.min(1, "لطفاً یک مقدار انتخاب کنید");
        }
        break;
      case "checkbox":
        fieldSchema = z.boolean();
        if (field.required) {
          fieldSchema = fieldSchema.refine((val) => val === true, {
            message: "باید تایید شود",
          });
        }
        break;
      case "date":
        fieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "تاریخ معتبر وارد کنید",
        });
        break;
      default:
        fieldSchema = z.string();
    }

    shape[field.name] = fieldSchema;
  });
  return z.object(shape);
};

export default generateSchema;

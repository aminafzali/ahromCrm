import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { createFormSchema, updateFormSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Form");
  }
}

export class FormServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createFormSchema,
      updateFormSchema,
      ["name", "description"],
      ["fields", "fields.options"]
    );
  }

  // Override create method to handle nested fields and options
  async create(data: any) {
    const formData = {
      ...data,
    };
    // todo:t3 نیاز به اصلاحیه جدی
    // return super.create(formData);
  }

  // Override update method to handle nested fields and options
  async update(id: number, data: any) {
    const formData = {
      ...data,
    };
    return super.update(id, formData);
  }

  async put(id: number, data: any) {
    const formData = {
      fields: data.fields
        ? {
            deleteMany: {},
            create: data.fields.map((field: any) => ({
              fieldId: field.id,
            })),
          }
        : undefined,
    };
    const entity = await this.repository.update(id, formData);

    return entity;
  }
}

// src/modules/device-types/validation/schema.ts

import { z } from 'zod';

// اسکیمای پایه شامل فیلدهای مشترک بین ایجاد و ویرایش
const baseSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد.'),
  description: z.string().optional().nullable(),
});

// اسکیمای مخصوص ایجاد
export const createDeviceTypeSchema = baseSchema;

// اسکیمای مخصوص ویرایش
export const updateDeviceTypeSchema = baseSchema;
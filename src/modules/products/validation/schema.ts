import { z } from "zod";

const productImageSchema = z.object({
  id: z.number().optional(),
  url: z.string().min(1, "URL تصویر الزامی است")
});

const productVariantSchema = z.object({
  sku: z.string().optional(),
  price: z.number().min(0, "قیمت باید بزرگتر از صفر باشد"),
  stock: z.number().min(0, "موجودی باید بزرگتر از صفر باشد"),
  attributes: z.record(z.any()),
});

const productAttributeSchema = z.object({
  name: z.string().min(1, "نام ویژگی الزامی است"),
  value: z.string().min(1, "مقدار ویژگی الزامی است"),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  price: z.number().min(0, "قیمت باید بزرگتر از صفر باشد"),
  stock: z.number().min(0, "موجودی باید بزرگتر از صفر باشد"),
  category: z.any().optional().nullable(),
  brand: z.any().optional().nullable(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  price: z.number().min(0, "قیمت باید بزرگتر از صفر باشد"),
  stock: z.number().min(0, "موجودی باید بزرگتر از صفر باشد"),
  category: z.any().optional().nullable(),
  brand: z.any().optional().nullable(),
  images: z.array(productImageSchema).optional()
});

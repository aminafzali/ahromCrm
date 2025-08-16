// مسیر فایل: src/modules/payment-categories/api/id/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { PaymentCategoryServiceApi } from "../../service/PaymentCategoryServiceApi";

const service = new PaymentCategoryServiceApi();

/**
 * کنترلر اختصاصی برای ماژول دسته‌بندی پرداخت‌ها
 */
class PaymentCategoryController extends BaseController<any> {
  constructor() {
    // پارامتر سوم (own) را false قرار می‌دهیم چون این موجودیت متعلق به کاربر خاصی نیست
    super(service, include);
  }
}

const controller = new PaymentCategoryController();

/**
 * دریافت جزئیات یک دسته‌بندی پرداخت
 * این تابع id را به صورت number دریافت می‌کند.
 */
export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}

/**
 * به‌روزرسانی یک دسته‌بندی پرداخت
 */
export async function PATCH(req: NextRequest, id: number) {
  return controller.update(req, id);
}

/**
 * حذف یک دسته‌بندی پرداخت
 */
export async function DELETE(req: NextRequest, id: number) {
  return controller.delete(req, id);
}

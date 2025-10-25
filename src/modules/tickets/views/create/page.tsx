"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTickets } from "../../hooks/useTickets";

export default function CreateTicketPage() {
  const router = useRouter();
  const { createTicket, loading } = useTickets();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM",
    categoryId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "موضوع تیکت الزامی است";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "موضوع باید حداقل 5 کاراکتر باشد";
    }

    if (!formData.description.trim()) {
      newErrors.description = "توضیحات تیکت الزامی است";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "توضیحات باید حداقل 10 کاراکتر باشد";
    }

    if (!formData.priority) {
      newErrors.priority = "انتخاب اولویت الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const ticketData = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId)
          : undefined,
      };

      const newTicket = await createTicket(ticketData);

      if (newTicket) {
        // Redirect to the new ticket detail page
        router.push(`/dashboard/tickets/${newTicket.id}`);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      setErrors({ submit: "خطا در ایجاد تیکت. لطفاً دوباره تلاش کنید." });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <DIcon icon="fa-arrow-right" classCustom="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ایجاد تیکت جدید
                </h1>
                <p className="text-gray-600 mt-1">
                  تیکت پشتیبانی جدید ایجاد کنید
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                موضوع تیکت <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.subject
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="موضوع تیکت خود را وارد کنید..."
                disabled={loading}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                اولویت <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.priority
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">انتخاب اولویت</option>
                <option value="LOW">پایین</option>
                <option value="MEDIUM">متوسط</option>
                <option value="HIGH">بالا</option>
                <option value="URGENT">فوری</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                دسته‌بندی
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
              >
                <option value="">انتخاب دسته‌بندی (اختیاری)</option>
                <option value="1">پشتیبانی فنی</option>
                <option value="2">سوالات عمومی</option>
                <option value="3">مشکلات حساب کاربری</option>
                <option value="4">درخواست ویژگی جدید</option>
                <option value="5">سایر</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                توضیحات <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  errors.description
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="توضیحات کامل مشکل یا درخواست خود را بنویسید..."
                disabled={loading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/500 کاراکتر
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <DIcon
                    icon="fa-exclamation-triangle"
                    classCustom="text-red-600"
                  />
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <DIcon icon="fa-times" classCustom="text-sm" />
                انصراف
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <DIcon
                      icon="fa-spinner"
                      classCustom="text-sm animate-spin"
                    />
                    در حال ایجاد...
                  </>
                ) : (
                  <>
                    <DIcon icon="fa-plus" classCustom="text-sm" />
                    ایجاد تیکت
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <div className="flex items-start gap-3">
            <DIcon
              icon="fa-info-circle"
              classCustom="text-blue-600 text-lg mt-0.5"
            />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                راهنمای ایجاد تیکت
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• موضوع تیکت را به صورت خلاصه و واضح بنویسید</li>
                <li>
                  • توضیحات کامل و دقیق ارائه دهید تا تیم پشتیبانی بتواند بهتر
                  کمک کند
                </li>
                <li>
                  • اولویت مناسب را انتخاب کنید (فوری فقط برای موارد اضطراری)
                </li>
                <li>
                  • دسته‌بندی مناسب انتخاب کنید تا تیکت به بخش مربوطه ارجاع شود
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

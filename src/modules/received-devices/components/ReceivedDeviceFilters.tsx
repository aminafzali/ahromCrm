// src/modules/received-devices/components/ReceivedDeviceFilters.tsx

"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";

// این کامپوننت فیلترها را از کاربر گرفته و به صفحه اصلی ارسال می‌کند
const ReceivedDeviceFilters = ({ onFilterChange }: { onFilterChange: (filters: any) => void }) => {
  const methods = useForm();
  const { register, handleSubmit, watch } = methods;

  // با هر تغییر در فرم، تابع onFilterChange را صدا می‌زنیم
  React.useEffect(() => {
    const subscription = watch((value) => {
      onFilterChange(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFilterChange]);

  return (
    <FormProvider {...methods}>
      <form className="p-4 bg-base-200 rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">جستجو در مدل/سریال</span>
            </label>
            <input
              type="text"
              {...register("search")}
              className="input input-bordered"
              placeholder="مدل یا شماره سریال..."
            />
          </div>
          {/* می‌توان فیلترهای دیگر (مانند بازه تاریخ) را نیز در اینجا اضافه کرد */}
        </div>
      </form>
    </FormProvider>
  );
};

export default ReceivedDeviceFilters;
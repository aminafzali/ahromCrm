// مسیر فایل: src/@Client/Components/ui/DatePicker.tsx

"use client";

import { Input } from "ndui-ahrom";
import React from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Controller, useFormContext } from "react-hook-form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/purple.css";

interface DatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  // ===== این پراپرتی جدید را اضافه می‌کنیم =====
  onDateChange?: (payload: { iso: string; jalali: string } | null) => void;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
  name,
  label,
  placeholder,
  className,
  onDateChange, // پراپرتی جدید را دریافت می‌کنیم
}) => {
  const methods = useFormContext();

  if (!methods) {
    console.error(`❌ DatePicker (${name}) must be used within a FormProvider.`);
    return null; // یا یک کامپوننت غیرفعال
  }

  const {
    control,
    formState: { errors },
  } = methods;
  const error = (errors as any)[name]?.message as string | undefined;

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label mb-1">
          <span className="label-text font-semibold text-gray-700">{label}</span>
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DatePicker
            value={field.value}
            onChange={(date: DateObject | null) => {
              if (date) {
                const isoString = date.toDate().toISOString();
                const jalaliString = date.format("YYYY/MM/DD");

                // ۱. مقدار اصلی را برای react-hook-form ثبت می‌کنیم
                field.onChange(isoString);

                // ۲. اگر تابع onDateChange وجود داشت، آن را با هر دو مقدار صدا می‌زنیم
                if (onDateChange) {
                  onDateChange({ iso: isoString, jalali: jalaliString });
                }
              } else {
                // مدیریت حالت پاک کردن تاریخ
                field.onChange(null);
                if (onDateChange) {
                  onDateChange(null);
                }
              }
            }}
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            className="purple"
            render={
              <Input
                placeholder={placeholder}
                //   error={error}
                className="w-full"
                readOnly name={""}              />
            }
          />
        )}
      />
      {error && (
        <label className="label mt-1">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default CustomDatePicker;

// // مسیر فایل: src/@Client/Components/ui/DatePicker.tsx

// "use client";

// import { Input } from "ndui-ahrom";
// import React from "react";
// import persian from "react-date-object/calendars/persian";
// import persian_fa from "react-date-object/locales/persian_fa";
// import { Controller, useFormContext } from "react-hook-form";
// import DatePicker, { DateObject } from "react-multi-date-picker";

// interface DatePickerProps {
//   name: string;
//   label?: string;
//   placeholder?: string;
//   className?: string;
// }

// const CustomDatePicker: React.FC<DatePickerProps> = ({
//   name,
//   label,
//   placeholder,
//   className,
// }) => {
//   // الگوبرداری دقیق از fallback هوشمندانه کامپوننت Switch شما
//   const methods = useFormContext() ?? {
//     control: undefined,
//     formState: { errors: {} },
//   };

//   if (!methods.control) {
//     console.error("❌ DatePicker must be used within a FormProvider.");
//     return null;
//   }

//   const {
//     control,
//     formState: { errors },
//   } = methods;
//   const error = (errors as any)[name]?.message as string | undefined;

//   return (
//     <div className={`form-control w-full ${className}`}>
//       {label && (
//         <label className="label mb-1">
//           <span className="label-text font-semibold text-gray-700">
//             {label}
//           </span>
//         </label>
//       )}
//       <Controller
//         control={control}
//         name={name}
//         render={({ field: { onChange, name, value } }) => (
//           <DatePicker
//             value={value}
//             onChange={(date: DateObject | DateObject[] | null) => {
//               // مقدار را به فرمت استاندارد ISO string تبدیل می‌کنیم
//               if (date instanceof DateObject) {
//                 onChange(date.toDate().toISOString());
//               } else {
//                 onChange(date);
//               }
//             }}
//             calendar={persian}
//             locale={persian_fa}
//             calendarPosition="bottom-right"
//             render={
//               <Input
//                 name={name} // name را برای Input پاس می‌دهیم
//                 placeholder={placeholder}
//                 //     error={error}
//                 className="w-full"
//               />
//             }
//           />
//         )}
//       />
//       {error && (
//         <label className="label mt-1">
//           <span className="label-text-alt text-error">{error}</span>
//         </label>
//       )}
//     </div>
//   );
// };

// export default CustomDatePicker;

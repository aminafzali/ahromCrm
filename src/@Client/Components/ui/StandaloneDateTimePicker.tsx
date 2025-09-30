"use client";

import DIcon from "@/@Client/Components/common/DIcon"; // بازگرداندن کامپوننت آیکون شما
import { Input } from "ndui-ahrom";
import React from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker, { type DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";

// تم رنگی Teal
import "react-multi-date-picker/styles/colors/teal.css";

interface StandaloneDateTimePickerProps {
  value: string | Date | null;
  onChange: (payload: { iso: string; jalali: string } | null) => void;
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}

const StandaloneDateTimePicker: React.FC<StandaloneDateTimePickerProps> = ({
  value,
  onChange,
  name,
  label,
  placeholder = "تاریخ و زمان را انتخاب کنید",
  className,
  error,
}) => {
  const handleChange = (date: DateObject | null) => {
    if (date) {
      const payload = {
        iso: date.toDate().toISOString(),
        jalali: date.format("YYYY/MM/DD HH:mm"),
      };
      onChange(payload);
    } else {
      onChange(null);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-4 text-right text-gray-700">
          {label}
          {!name.toLowerCase().includes("id") && (
            <span className="text-red-500 mr-1">*</span>
          )}
        </label>
      )}
      <DatePicker
        value={value}
        onChange={handleChange}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        format="YYYY/MM/DD HH:mm"
        className="teal"
        plugins={[<TimePicker key="timepicker" position="top" hideSeconds />]}
        render={(inputValue, openCalendar) => {
          return (
            <div>
              <div
                className="relative w-full group cursor-pointer"
                onClick={openCalendar}
              >
                <Input
                  name={name}
                  placeholder={placeholder}
                  // کلاس‌های اصلاح شده برای استایل بهتر
                  className={`
                    w-full px-3 py-2 bg-white text-sm
                    border rounded-lg transition-colors
                    ${error ? "border-red-500" : "border-gray-300"}
                    focus:outline-none focus:border-teal-700
                    pl-10 
                  `}
                  readOnly
                  value={inputValue}
                />
                {/* آیکون به سمت چپ منتقل شده تا با متن تداخل نداشته باشد */}
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 group-hover:text-teal-700 transition-colors pointer-events-none">
                  <DIcon icon="far fa-calendar-alt" cdi={false} />
                </div>
              </div>
              {error && (
                <p className="text-red-600 text-xs mt-1 text-right">{error}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default StandaloneDateTimePicker;

// "use client";

// import { Input } from "ndui-ahrom";
// import React from "react";
// import persian from "react-date-object/calendars/persian";
// import persian_fa from "react-date-object/locales/persian_fa";
// import DatePicker, { type DateObject } from "react-multi-date-picker";
// import TimePicker from "react-multi-date-picker/plugins/time_picker";

// // تم‌های رنگی
// import "react-multi-date-picker/styles/colors/teal.css";

// interface StandaloneDateTimePickerProps {
//   value: string | Date | null;
//   onChange: (payload: { iso: string; jalali: string } | null) => void;
//   name: string;
//   label?: string;
//   placeholder?: string;
//   className?: string;
//   error?: string;
// }

// const StandaloneDateTimePicker: React.FC<StandaloneDateTimePickerProps> = ({
//   value,
//   onChange,
//   name,
//   label,
//   placeholder = "تاریخ و زمان را انتخاب کنید",
//   className,
//   error,
// }) => {
//   const handleChange = (date: DateObject | null) => {
//     if (date) {
//       const payload = {
//         iso: date.toDate().toISOString(),
//         jalali: date.format("YYYY/MM/DD HH:mm"),
//       };
//       onChange(payload);
//     } else {
//       onChange(null);
//     }
//   };

//   return (
//     <div className={`w-full ${className}`}>
//       {label && (
//         <label className="block text-sm font-medium mb-2 text-right">
//           {label}
//           {!name.toLowerCase().includes("id") && (
//             <span className="text-red-500">*</span>
//           )}
//         </label>
//       )}
//       <DatePicker
//         value={value}
//         onChange={handleChange}
//         calendar={persian}
//         locale={persian_fa}
//         calendarPosition="bottom-right"
//         format="YYYY/MM/DD HH:mm"
//         className="teal"
//         plugins={[<TimePicker key="timepicker" position="top" hideSeconds />]}
//         render={(inputValue, openCalendar) => {
//           return (
//             <div
//               className="relative w-full group cursor-pointer"
//               onClick={openCalendar}
//             >
//               <Input
//                 name={name}
//                 placeholder={placeholder}
//                 className={`w-full px-4 py-2 border ${
//                   error ? "border-red-500" : "border-gray-300"
//                 } rounded-md bg-white text-sm text-right focus:outline-none focus:ring-2 ${
//                   error ? "focus:ring-red-500" : "focus:ring-blue-500"
//                 } pr-12`}
//                 readOnly
//                 value={inputValue}
//               />
//               <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 group-hover:text-blue-500 transition-colors pointer-events-none">
//                 <i className="far fa-calendar-alt"></i>{" "}
//                 {/* Assuming DIcon is replaced with <i> for fa-calendar-alt */}
//               </div>
//               {error && (
//                 <p className="text-red-500 text-xs mt-1 text-right">{error}</p>
//               )}
//             </div>
//           );
//         }}
//       />
//     </div>
//   );
// };

// export default StandaloneDateTimePicker;

// "use client";

// import { Input } from "ndui-ahrom";
// import React from "react";
// import persian from "react-date-object/calendars/persian";
// import persian_fa from "react-date-object/locales/persian_fa";
// import DatePicker, { type DateObject } from "react-multi-date-picker";
// import TimePicker from "react-multi-date-picker/plugins/time_picker";

// // تم‌های رنگی
// import "react-multi-date-picker/styles/colors/teal.css";

// interface StandaloneDateTimePickerProps {
//   value: string | Date | null;
//   onChange: (payload: { iso: string; jalali: string } | null) => void;
//   name: string;
//   label?: string;
//   placeholder?: string;
//   className?: string;
//   error?: string;
// }

// const StandaloneDateTimePicker: React.FC<StandaloneDateTimePickerProps> = ({
//   value,
//   onChange,
//   name,
//   label,
//   placeholder = "تاریخ و زمان را انتخاب کنید",
//   className,
//   error,
// }) => {
//   const handleChange = (date: DateObject | null) => {
//     if (date) {
//       const payload = {
//         iso: date.toDate().toISOString(),
//         jalali: date.format("YYYY/MM/DD HH:mm"),
//       };
//       onChange(payload);
//     } else {
//       onChange(null);
//     }
//   };

//   return (
//     <div className={`w-full ${className}`}>
//       <div>
//         {label && (
//           <label className="form-label mb-2">
//             {label} {/* اگر نام فیلد شامل Id نباشد، ستاره قرمز را نمایش بده */}
//             {!name.toLowerCase().includes("id") && (
//               <span className="text-danger">*</span>
//             )}
//           </label>
//         )}
//       </div>
//       <DatePicker
//         value={value}
//         onChange={handleChange}
//         calendar={persian}
//         locale={persian_fa}
//         calendarPosition="bottom-right"
//         format="YYYY/MM/DD HH:mm"
//         className="teal"
//         plugins={[<TimePicker key="timepicker" position="top" hideSeconds />]}
//         render={(inputValue, openCalendar) => {
//           return (
//             // کانتینر اصلی با position relative برای جایگذاری آیکون
//             <div
//               className="position-relative w-full group"
//               onClick={openCalendar}
//             >
//               <Input
//                 name={name}
//                 placeholder={placeholder}
//                 // کلاس‌ها برای ظاهر بهتر، ایجاد فاصله برای آیکون و حالت خطا
//                 className={`w-100 cursor-pointer pe-5 ${
//                   error ? "is-invalid" : ""
//                 }`}
//                 readOnly
//                 value={inputValue}
//               />
//               {/* آیکون در اینجا با position absolute در جای صحیح قرار می‌گیرد
//               <div className="position-absolute top-50 start-0 translate-middle-y ps-3 user-select-none">
//                 <div className="text-secondary group-hover:text-primary transition-all">
//                   <DIcon icon="fa-calendar-alt" cdi={false} />
//                 </div>
//               </div> */}

//               {/* نمایش پیام خطا */}
//               {error && <div className="invalid-feedback d-block">{error}</div>}
//             </div>
//           );
//         }}
//       />
//     </div>
//   );
// };

// export default StandaloneDateTimePicker;

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import { Input } from "ndui-ahrom";
// import React from "react";
// import persian from "react-date-object/calendars/persian";
// import persian_fa from "react-date-object/locales/persian_fa";
// import DatePicker, { type DateObject } from "react-multi-date-picker";
// import TimePicker from "react-multi-date-picker/plugins/time_picker";

// // تم‌های رنگی
// import "react-multi-date-picker/styles/colors/teal.css";

// interface StandaloneDateTimePickerProps {
//   value: string | Date | null;
//   onChange: (payload: { iso: string; jalali: string } | null) => void;
//   name: string;
//   label?: string;
//   placeholder?: string;
//   className?: string;
//   error?: string;
// }

// const StandaloneDateTimePicker: React.FC<StandaloneDateTimePickerProps> = ({
//   value,
//   onChange,
//   name,
//   label,
//   placeholder,
//   className,
//   error,
// }) => {
//   const handleChange = (date: DateObject | null) => {
//     if (date) {
//       const payload = {
//         iso: date.toDate().toISOString(),
//         jalali: date.format("YYYY/MM/DD HH:mm"),
//       };
//       onChange(payload);
//     } else {
//       onChange(null);
//     }
//   };

//   return (
//     <div className={`w-full ${className}`}>
//       {label && (
//         <label className="form-label mb-2">
//           {label} <span className="text-danger">*</span>
//         </label>
//       )}
//       <DatePicker
//         value={value}
//         onChange={handleChange}
//         calendar={persian}
//         locale={persian_fa}
//         calendarPosition="bottom-right"
//         format="YYYY/MM/DD HH:mm" // فرمت با زمان
//         className="teal" // تم رنگی
//         plugins={[
//           <TimePicker key="timepicker" position="bottom" hideSeconds />, // پلاگین انتخاب زمان
//         ]}
//         render={(inputValue, openCalendar) => {
//           return (
//             <div
//               className="relative w-full group flex justify-center "
//               onClick={openCalendar}
//             >
//               <DIcon icon="w-full fa-calendar-alt" cdi={false} />
//               <Input
//                 name={name}
//                 placeholder={placeholder}
//                 className={`w-full cursor-pointer ${error ? "is-invalid" : ""}`}
//                 readOnly
//                 value={inputValue}
//               />

//               {error && <div className="invalid-feedback d-block">{error}</div>}
//             </div>
//           );
//         }}
//       />
//     </div>
//   );
// };

// export default StandaloneDateTimePicker;

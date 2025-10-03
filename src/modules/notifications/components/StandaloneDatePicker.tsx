// مسیر فایل: src/modules/notifications/components/StandaloneDatePicker.tsx

"use client";

import { Input } from "ndui-ahrom";
import React from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker, { type DateObject } from "react-multi-date-picker";

// تم‌های رنگی و استایل‌های پیش‌فرض
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import "react-multi-date-picker/styles/colors/green.css";

// آیکون برای زیبایی بیشتر
import DIcon from "@/@Client/Components/common/DIcon";

interface StandaloneDatePickerProps {
  value: string | Date | null;
  onChange: (payload: { iso: string; jalali: string } | null) => void;
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

const StandaloneDatePicker: React.FC<StandaloneDatePickerProps> = ({
  value,
  onChange,
  name,
  label,
  placeholder,
  className,
}) => {
  const handleChange = (date: DateObject | null) => {
    if (date) {
      const payload = {
        iso: date.toDate().toISOString(),
        jalali: date.format("YYYY/MM/DD"),
      };
      onChange(payload);
    } else {
      onChange(null);
    }
  };

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label mb-1 px-1">
          <span className="label-text text-base-content/80 font-medium">
            {label}
          </span>
        </label>
      )}
      <DatePicker
        value={value}
        onChange={handleChange}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        // استفاده از تم سبز که به teal نزدیک است
        className="green"
        render={(inputValue, openCalendar) => {
          // inputValue توسط DatePicker به صورت خودکار با تاریخ فرمت‌شده پر می‌شود
          return (
            <div
              className="relative w-full group"
              onClick={openCalendar} // کل این بخش قابل کلیک است
            >
              <Input
                name={name}
                placeholder={placeholder}
                className="w-full cursor-pointer input-bordered group-hover:border-primary transition-all"
                readOnly
                value={inputValue}
              />
              <div className="absolute top-1/2 -translate-y-1/2 left-3 flex items-center pointer-events-none text-base-content/40 group-hover:text-primary transition-all">
                <DIcon icon="fa-calendar-alt" cdi={false} />
              </div>
            </div>
          );
        }}
      >
        {/* یک دکمه برای پاک کردن تاریخ جهت تجربه کاربری بهتر */}
        <div className="p-2 flex justify-end">
          <button
            type="button"
            className="btn btn-xs btn-ghost text-error"
            onClick={() => onChange(null)}
          >
            پاک کردن تاریخ
          </button>
        </div>
      </DatePicker>
    </div>
  );
};

export default StandaloneDatePicker;

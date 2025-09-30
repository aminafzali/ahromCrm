// مسیر فایل: src/components/ui/Switch.tsx (یا مسیر مشابه برای کامپوننت‌های ndui-ahrom)

"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  name: string;
  placeholder?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

// الگوبرداری دقیق از کامپوننت Input شما
const Switch: React.FC<SwitchProps> = ({
  name,
  label,
  placeholder,
  size = "md",
  className = "",
  ...props
}) => {
  // ===== شروع اصلاحیه کلیدی =====
  // اکنون دقیقاً از همان الگوی هوشمندانه شما برای مدیریت context استفاده می‌کنیم
  const methods = useFormContext() ?? {
    register: () => ({}),
    formState: { errors: {} },
  };
  // ===== پایان اصلاحیه کلیدی =====

  const {
    register,
    formState: { errors },
  } = methods;
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="form-control w-full">
      <label className="label cursor-pointer justify-start gap-4 py-0">
        <div className="flex flex-col">
          {label && <span className="label-text font-semibold">{label}</span>}
          {placeholder && (
            <span className="text-xs text-gray-400">{placeholder}</span>
          )}
        </div>
        <input
          type="checkbox"
          className={`toggle toggle-primary ${size ? `toggle-${size}` : ""} ${
            error ? "toggle-error" : ""
          } ${className}`}
          {...props}
          {...register(name)}
        />
      </label>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default Switch;

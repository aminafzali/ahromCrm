// مسیر فایل: src/components/ui/Switch.tsx (یا مسیر مشابه برای کامپوننت‌های ndui-ahrom)

"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const Switch: React.FC<SwitchProps> = ({
  name,
  label,
  size = "md",
  className = "",
  ...props
}) => {
  const methods = useFormContext();
  if (!methods) {
    console.error("❌ useFormContext() is null! Make sure this Switch component is inside a FormProvider.");
    return null;
  }

  const { register, formState: { errors } } = methods;
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label cursor-pointer justify-start gap-4">
          <span className="label-text">{label}</span>
          <input
            type="checkbox"
            className={`toggle toggle-primary ${size ? `toggle-${size}` : ""} ${
              error ? "toggle-error" : ""
            } ${className}`}
            {...props}
            {...register(name)}
          />
        </label>
      )}
       {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default Switch;
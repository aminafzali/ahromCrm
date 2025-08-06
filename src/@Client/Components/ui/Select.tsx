// مسیر فایل: src/components/ui/Select.tsx

"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "size" | "value" | "defaultValue"
  > {
  name: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  renderOption?: (opt: Option) => React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  name,
  label,
  options,
  renderOption,
  size = "md",
  className = "",
  placeholder = "یک گزینه انتخاب کنید",
  ...props
}) => {
  // 1️⃣ وصل شدن به context فرم
  const methods = useFormContext() ?? {
    register: () => ({}),
    formState: { errors: {} as Record<string, any> },
  };
  const {
    register,
    formState: { errors },
  } = methods;

  // 2️⃣ خطای فیلد
  const error = (errors as any)[name]?.message as string | undefined;

  // 3️⃣ رندر
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label mb-1">
          <span className="label-text font-semibold text-gray-700">
            {label}
          </span>
        </label>
      )}

      <select
        className={`select select-bordered w-full ${
          size ? `select-${size}` : ""
        } ${error ? "select-error" : ""} ${className}`}
        {...props}
        {...register(name)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) =>
          renderOption ? (
            renderOption(opt)
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>

      {error && (
        <label className="label mt-1">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default Select;

/* eslint-disable jsx-a11y/role-supports-aria-props */
import React from "react";
import { useFormContext } from "react-hook-form";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: Option[];
  name: string;
  placeholder?: string;
  renderOption?: (option: Option) => React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
}

const Select: React.FC<SelectProps> = ({
  name,
  label,
  options,
  renderOption,
  size = "md",
  className = "",
  placeholder = "",
  ...props
}) => {
  const methods = useFormContext();
  if (!methods) {
    console.error("❌ useFormContext() is null! Make sure this Select component is inside a FormProvider.");
    return null;
  }

  const { register, setValue, watch, formState: { errors } } = methods;
  const error = errors[name]?.message as string | undefined;
  const selectedValue = watch(name) ?? "";

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <select
        aria-placeholder={placeholder}
        className={`select select-bordered ${size ? `select-${size}` : ""} ${
          error ? "select-error" : ""
        } ${className}`}
        value={selectedValue}
        {...props}
        {...register(name, {
          setValueAs: (value) => (/^\d+$/.test(value) ? Number(value) : value),
        })}
        onChange={(e) => {
          const selectedValue = e.target.value;
          setValue(name, /^\d+$/.test(selectedValue) ? Number(selectedValue) : selectedValue);
        }}
      >
        <option value="" disabled>{placeholder || "یک گزینه انتخاب کنید"}</option>
        {options.map((option) =>
          renderOption ? (
            renderOption(option)
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </select>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default Select;

import React from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  options: Option[];
  name: string;
  placeholder?: string;
  renderOption?: (option: Option) => React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
}

const Select23: React.FC<SelectProps> = ({
  name,
  label,
  options,
  renderOption,
  size = "md",
  className = "",
  placeholder = "",
  value,
  onChange,
  ...props
}) => {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <select
        name={name}
        className={`select select-bordered ${
          size ? `select-${size}` : ""
        } ${className}`}
        value={value ?? ""}
        onChange={onChange}
        {...props}
      >
        {/* placeholder به صورت value="" و بدون selected/disabled تا کنترل‌شده باشد */}
        <option value="">{placeholder || "یک گزینه انتخاب کنید"}</option>

        {options.map((option) =>
          renderOption ? (
            renderOption(option)
          ) : (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          )
        )}
      </select>
    </div>
  );
};

export default Select23;

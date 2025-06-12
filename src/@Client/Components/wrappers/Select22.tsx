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

const Select22: React.FC<SelectProps> = ({
  name,
  label,
  options,
  renderOption,
  size = "md",
  className = "",
  placeholder = "",
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
        className={`select select-bordered ${
          size ? `select-${size}` : ""
        }  ${className}`}
        {...props}
      >
        <option value="" disabled selected>
          {placeholder || "یک گزینه انتخاب کنید"}
        </option>

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
    </div>
  );
};

export default Select22;

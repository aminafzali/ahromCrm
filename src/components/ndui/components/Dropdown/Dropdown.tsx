import React, { useCallback, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Select, { components, StylesConfig } from "react-select";
import Chip from "../Chips/Chips";

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
  disabled?: boolean;
}

interface DropdownProps {
  name: string;
  options: Option[];
  label?: string;
  placeholder?: string;
  returnValue?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isLoading?: boolean;
  error?: string;
  className?: string;
  onChange?: (value: any) => void;
  renderChip?: ({ data, removeProps }: any) => React.ReactNode;
  onInputChange?: (value: string) => void;
  customStyles?: StylesConfig;
  isDisabled?: boolean;
  menuPlacement?: "auto" | "bottom" | "top";
  required?: boolean;
  helperText?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  groupBy?: (option: Option) => string;
}

const Dropdown: React.FC<DropdownProps> = ({
  name,
  options,
  renderChip,
  label,
  placeholder = "انتخاب کنید...",
  isMulti = false,
  isSearchable = true,
  isClearable = true,
  isLoading = false,
  className = "",
  onChange,
  onInputChange,
  returnValue,
  customStyles,
  isDisabled = false,
  menuPlacement = "auto",
  required = false,
  helperText,
  noOptionsMessage = "موردی یافت نشد",
  loadingMessage = "در حال بارگذاری...",
  groupBy,
}) => {
  const methods = useFormContext();

  if (!methods) {
    console.warn("Dropdown باید درون FormProvider باشد.");
    return null;
  }

  const {
    control,
    formState: { errors },
  } = methods;

  const fieldError = errors[name]?.message as string;

  // Memoize grouped options
  const groupedOptions = useMemo(() => {
    if (!groupBy) return options;

    const groups = options.reduce((acc: any, option) => {
      const group = groupBy(option);
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {});

    return Object.entries(groups).map(([label, options]) => ({
      label,
      options,
    }));
  }, [options, groupBy]);

  // Custom components
  const customComponents = {
    MultiValue: ({ data, removeProps }: any) =>
      renderChip ? (
        renderChip({ data, removeProps })
      ) : (
        <Chip
          label={data.label}
          icon={data.icon}
          onDelete={removeProps.onClick}
          className="m-1 p-2"
          color={data.color || "primary"}
          variant="filled"
        />
      ),
    Option: ({ data, isSelected, isFocused, innerProps }: any) => (
      <div
        {...innerProps}
        className={`
          flex items-center gap-2 px-4 py-2 cursor-pointer
          ${isSelected ? "bg-primary text-primary-content" : ""}
          ${!isSelected && isFocused ? "bg-base-200" : ""}
          ${data.disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {data.icon && <span>{data.icon}</span>}
        <div>
          <div>{data.label}</div>
          {data.description && (
            <div className="text-sm opacity-70">{data.description}</div>
          )}
        </div>
      </div>
    ),
    NoOptionsMessage: ({ children }: any) => (
      <div className="text-center py-2 text-base-content/50">
        <div>{noOptionsMessage}</div>
      </div>
    ),
    LoadingMessage: () => (
      <div className="text-center py-2 text-base-content/50">
        <span className="loading loading-spinner loading-sm mr-2"></span>
        {loadingMessage}
      </div>
    ),
  };

  // Handle value formatting
  const formatValue = useCallback(
    (fieldValue: any) => {
      console.log("formatValue" , fieldValue)
      if (isMulti) {
        return options.filter((option) => fieldValue?.includes(option.value));
      }
      return options.find((option) => option.value === fieldValue) || null;
    },
    [options, isMulti]
  );

  // Handle change
  const handleChange = useCallback(
    (selectedOption: any, field: any) => {
      console.log("handleChange selectedOption" , selectedOption)
      console.log("handleChange field" , field)
      if (isMulti) {
        const values = selectedOption
          ? (selectedOption as Option[]).map((opt) => {
            if (returnValue) {
              return {returnValue : opt.value}
            } else {
              return opt.value
            }
          })
          : [];
          console.log("handleChange values" , values)
        field.onChange(values);
      } else {
        const value = selectedOption ? (selectedOption as Option).value : null;
        field.onChange(value);
      }
      onChange?.(selectedOption);
    },
    [isMulti, onChange]
  );

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">
            {label}
            {required && <span className="text-error mr-1">*</span>}
          </span>
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            value={formatValue(field.value)}
            onChange={(selectedOption) => handleChange(selectedOption, field)}
            onInputChange={onInputChange}
            options={groupBy ? groupedOptions : options}
            isMulti={isMulti}
            isSearchable={isSearchable}
            isClearable={isClearable}
            isLoading={isLoading}
            isDisabled={isDisabled}
            placeholder={placeholder}
            menuPlacement={menuPlacement}
            className={`${fieldError ? "select-error" : ""} ${className}`}
            classNames={{
              control: (state) => `
                input input-bordered
                ${fieldError ? "input-error" : ""}
                ${state.isFocused ? "input-primary" : ""}
                !min-h-[2.5rem]
              `,
              menu: () => "bg-base-100 shadow-lg rounded-lg mt-1 p-1",
              menuList: () => "max-h-60",
              multiValue: () => "bg-transparent",
              placeholder: () => "text-base-content/50",
              noOptionsMessage: () => "text-center py-2 text-base-content/50",
              group: () => "border-b last:border-b-0",
              groupHeading: () => "text-sm font-semibold px-3 py-2",
            }}
            styles={customStyles}
          />
        )}
      />

      {(fieldError || helperText) && (
        <label className="label">
          <span
            className={`label-text-alt ${
              fieldError ? "text-error" : "text-base-content/70"
            }`}
          >
            {fieldError || helperText}
          </span>
        </label>
      )}
    </div>
  );
};

export default Dropdown;

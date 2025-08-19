import React, { useCallback, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Select, { components, StylesConfig } from "react-select";
import Chip from "../Chips/Chips";
import { motion, AnimatePresence } from "framer-motion";

export interface Option {
  value: any; // Allow any type of value
  label: string;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
  disabled?: boolean;
  metadata?: any; // Additional data that might be needed
}

interface DropdownProps {
  name: string;
  options: Option[];
  label?: string;
  placeholder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isLoading?: boolean;
  error?: string;
  className?: string;
  onChange?: (value: any) => void;
  onInputChange?: (value: string) => void;
  customStyles?: StylesConfig;
  isDisabled?: boolean;
  menuPlacement?: "auto" | "bottom" | "top";
  required?: boolean;
  helperText?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  groupBy?: (option: Option) => string;
  formatOptionLabel?: (option: Option) => React.ReactNode;
  formatSelectedLabel?: (option: Option) => React.ReactNode;
  allowCreate?: boolean;
  onCreateOption?: (inputValue: string) => void;
  validateOption?: (option: Option) => boolean;
  size?: "sm" | "md" | "lg";
  renderChip?: (option: Option, onRemove: () => void) => React.ReactNode;
}

const DropdownV2: React.FC<DropdownProps> = ({
  name,
  options,
  label,
  placeholder = "Select...",
  isMulti = false,
  isSearchable = true,
  isClearable = true,
  isLoading = false,
  className = "",
  onChange,
  onInputChange,
  customStyles,
  isDisabled = false,
  menuPlacement = "auto",
  required = false,
  helperText,
  noOptionsMessage = "No options found",
  loadingMessage = "Loading...",
  groupBy,
  formatOptionLabel,
  formatSelectedLabel,
  allowCreate = false,
  onCreateOption,
  validateOption,
  size = "md",
  renderChip,
}) => {
  const methods = useFormContext();
  const [inputValue, setInputValue] = useState("");

  if (!methods) {
    console.warn("Dropdown must be used within a FormProvider");
    return null;
  }

  const {
    control,
    formState: { errors },
  } = methods;

  const fieldError = errors[name]?.message as string;

  // Group options if groupBy is provided
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
    Option: ({ data, isSelected, isFocused, innerProps }: any) => (
      <motion.div
        {...innerProps}
        initial={false}
        animate={{
          backgroundColor: isFocused ? "rgba(0,0,0,0.05)" : "transparent",
        }}
        className={`
          flex items-center gap-2 px-4 py-2 cursor-pointer
          ${isSelected ? "bg-primary text-primary-content" : ""}
          ${!isSelected && isFocused ? "bg-base-200" : ""}
          ${data.disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {formatOptionLabel ? (
          formatOptionLabel(data)
        ) : (
          <>
            {data.icon && <span>{data.icon}</span>}
            <div>
              <div>{data.label}</div>
              {data.description && (
                <div className="text-sm opacity-70">{data.description}</div>
              )}
            </div>
          </>
        )}
      </motion.div>
    ),
    MultiValue: ({ data, removeProps }: any) =>
      renderChip ? (
        renderChip(data, removeProps.onClick)
      ) : (
        <Chip
          label={formatSelectedLabel ? formatSelectedLabel(data) : data.label}
          icon={data.icon}
          onDelete={removeProps.onClick}
          className="m-1"
          color={data.color || "primary"}
          variant="filled"
        />
      ),
    NoOptionsMessage: () => (
      <div className="text-center py-2 text-base-content/50">
        {allowCreate && inputValue ? (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onCreateOption?.(inputValue)}
          >
            Create "{inputValue}"
          </button>
        ) : (
          noOptionsMessage
        )}
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
      if (isMulti) {
        return options.filter((option) => 
          Array.isArray(fieldValue) && fieldValue.includes(option.value)
        );
      }
      return options.find((option) => option.value === fieldValue) || null;
    },
    [options, isMulti]
  );

  // Handle change
  const handleChange = useCallback(
    (selectedOption: any, field: any) => {
      if (isMulti) {
        const values = selectedOption
          ? (selectedOption as Option[]).map((opt) => opt.value)
          : [];
        field.onChange(values);
      } else {
        const value = selectedOption ? (selectedOption as Option).value : null;
        field.onChange(value);
      }
      onChange?.(selectedOption);
    },
    [isMulti, onChange]
  );

  const sizeClasses = {
    sm: "min-h-[2rem]",
    md: "min-h-[2.5rem]",
    lg: "min-h-[3rem]",
  };

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
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
            onInputChange={(value) => {
              setInputValue(value);
              onInputChange?.(value);
            }}
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
                ${sizeClasses[size]}
              `,
              menu: () => "bg-base-100 shadow-lg rounded-lg mt-1 p-1",
              menuList: () => "max-h-60",
              multiValue: () => "bg-transparent",
              placeholder: () => "text-base-content/50",
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

export default DropdownV2;
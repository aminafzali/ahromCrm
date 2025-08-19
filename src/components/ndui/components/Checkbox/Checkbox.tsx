import React from "react";
import { useFormContext } from "react-hook-form";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  name: string;
  label?: string;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  className = "",
  ...props
}) => {
  const methods = useFormContext() ?? {
    register: () => ({}),
    formState: { errors: {} },
  };
  const {
    register,
    formState: { errors },
  } = methods;
  const error = errors[name]?.message as string | undefined;


  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start">
        <input
          type="checkbox"
          {...register(name)}
          className={`checkbox ${error ? "checkbox-error" : ""} ${className}`}
          {...props}
        />
        {label && <span className="label-text mx-2">{label}</span>}
      </label>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default Checkbox;

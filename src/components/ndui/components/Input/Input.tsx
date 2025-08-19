import React from "react";
import { useFormContext } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  labelClassName?: string;
  errorClassName?: string;
  className?: string;
  variant?: "bordered" | "ghost" | "primary";
  inputSize?: "xs" | "sm" | "md" | "lg";
  prepend?: React.ReactNode;
  append?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  name, 
  label, 
  labelClassName = "",
  errorClassName = "",
  variant = "bordered", 
  inputSize = "md", 
  className = "", 
  prepend,
  append,
  ...props 
}) => {
  const methods = useFormContext() ?? { register: () => ({}), formState: { errors: {} } };
  const { register, formState: { errors } } = methods;
  const error = errors[name]?.message as string | undefined;

  const registerOptions = props.type === "number" ? { valueAsNumber: true } : {};

  const baseClass = `input input-${variant} input-${inputSize} ${error ? "input-error" : ""} ${className}`;

  return (
    <div className="form-control w-full">
      {label && (
        <label className={`label ${labelClassName}`}>
          <span className="label-text">{label}</span>
        </label>
      )}
      
      <div className="flex flex-row-reverse">
        {prepend && (
          <div className="px-1 flex flex-col justify-center">
            {prepend}
          </div>
        )}
        
        <input 
          aria-invalid={!!error}
          {...register(name, registerOptions)} 
          className={`
            ${baseClass}
            ${prepend || append ? "flex-1" : "w-full"}
          `} 
          {...props} 
        />
        
        {append && (
          <div className="px-1 flex flex-col justify-center">
            {append}
          </div>
        )}
      </div>
      
      {error && (
        <label className={`label ${errorClassName}`}>
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default Input;

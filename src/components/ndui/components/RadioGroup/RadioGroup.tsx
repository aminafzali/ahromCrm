import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  error?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  label,
  error,
  className = '',
  orientation = 'vertical',
}) => {
  return (
    <div className="form-control">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      
      <div className={`
        ${orientation === 'horizontal' ? 'flex gap-4' : 'space-y-2'}
        ${className}
      `}>
        {options.map((option) => (
          <label key={option.value} className="label cursor-pointer">
            <input
              type="radio"
              name={name}
              className={`radio ${error ? 'radio-error' : ''}`}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={option.disabled}
            />
            <span className="label-text ml-2">{option.label}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default RadioGroup;
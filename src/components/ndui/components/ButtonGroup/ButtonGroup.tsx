import React from 'react';

interface ButtonGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  options,
  value,
  onChange,
  size,
  variant = 'primary',
  className = '',
}) => {
  return (
    <div className={`join ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`
            btn join-item
            ${size ? `btn-${size}` : ''}
            ${value === option.value ? `btn-${variant}` : ''}
          `}
          onClick={() => onChange(option.value)}
          disabled={option.disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;
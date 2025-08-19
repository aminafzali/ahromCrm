import React from 'react';

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  className?: string;
  size?: undefined;
  color?: 'primary' | 'secondary' | 'accent';
}

const Toggle: React.FC<ToggleProps> = ({
  label,
  error,
  className = '',
  size = 'md',
  color = 'primary',
  ...props
}) => {
  return (
    <div className="form-control">
      <label className="label cursor-pointer">
        <input
          type="checkbox"
          className={`
            toggle toggle-${color}
            ${size !== 'md' ? `toggle-${size}` : ''}
            ${error ? 'toggle-error' : ''}
            ${className}
          `}
          {...props}
        />
        {label && <span className="label-text ml-2">{label}</span>}
        
      </label>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default Toggle;
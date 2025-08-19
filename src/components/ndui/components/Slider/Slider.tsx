import React from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  className?: string;
  color?: 'primary' | 'secondary' | 'accent';
  size?: any;
}

const Slider: React.FC<SliderProps> = ({
  label,
  error,
  className = '',
  color = 'primary',
  size = 'md',
  ...props
}) => {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      
      <input
        type="range"
        className={`
          range range-${color}
          ${size !== 'md' ? `range-${size}` : ''}
          ${error ? 'range-error' : ''}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default Slider;
import React from 'react';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  className?: string;
}

const Radio: React.FC<RadioProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="form-control">
      <label className="label cursor-pointer">
        <input
          type="radio"
          className={`radio ${error ? 'radio-error' : ''} ${className}`}
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

export default Radio;
import React from 'react';

interface ChipProps {
  label: React.ReactNode;
  onDelete?: () => void;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Chip: React.FC<ChipProps> = ({
  label,
  onDelete,
  icon,
  color = 'primary',
  variant = 'filled',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'badge-sm',
    md: '',
    lg: 'badge-lg',
  };

  return (
    <div className={`
      badge gap-2
      ${variant === 'filled' ? `badge-${color}` : `badge-outline badge-${color}`}
      ${sizeClasses[size]}
      ${className}
    `}>
      {icon && <span>{icon}</span>}
      
      {label}
      {onDelete && (
        <button
          className="btn btn-ghost btn-xs px-1"
          onClick={onDelete}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Chip;
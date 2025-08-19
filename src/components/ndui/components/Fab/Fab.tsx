import React from 'react';

interface FabProps {
  icon: React.ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Fab: React.FC<FabProps> = ({
  icon,
  onClick,
  position = 'bottom-right',
  color = 'primary',
  size = 'md',
  className = '',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      className={`
        btn btn-circle btn-${color} fixed
        ${positionClasses[position]}
        ${sizeClasses[size]}
        ${className}
      `}
      onClick={onClick}
    >
      {icon}
    </button>
  );
};

export default Fab;
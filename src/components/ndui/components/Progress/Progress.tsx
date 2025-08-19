import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  type?: 'bar' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  type = 'bar',
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const percentage = (value / max) * 100;

  if (type === 'circle') {
    const sizeClass = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32'
    }[size];

    return (
      <div className={`radial-progress ${sizeClass} text-${color} ${className}`}
           style={{ '--value': percentage } as any}>
        {Math.round(percentage)}%
      </div>
    );
  }

  return (
    <progress
      className={`
        progress progress-${color}
        ${size !== 'md' ? `progress-${size}` : ''}
        ${className}
      `}
      value={value}
      max={max}
    />
  );
};

export default Progress;
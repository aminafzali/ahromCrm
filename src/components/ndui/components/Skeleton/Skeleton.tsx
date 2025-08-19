import React from 'react';

interface SkeletonProps {
  type?: 'text' | 'rectangle' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  type = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
}) => {
  const getStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (width) {
      styles.width = typeof width === 'number' ? `${width}px` : width;
    }
    
    if (height) {
      styles.height = typeof height === 'number' ? `${height}px` : height;
    }
    
    return styles;
  };

  return (
    <div
      className={`
        bg-base-300
        ${type === 'circle' ? 'rounded-full' : 'rounded'}
        ${animation === 'pulse' ? 'animate-pulse' : ''}
        ${animation === 'wave' ? 'skeleton-wave' : ''}
        ${type === 'text' ? 'h-4 w-full' : ''}
        ${className}
      `}
      style={getStyles()}
    />
  );
};

export default Skeleton;
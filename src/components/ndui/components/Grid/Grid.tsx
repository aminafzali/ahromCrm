import React from 'react';

interface GridProps {
  children: React.ReactNode;
  columns?: number | { [breakpoint: string]: number };
  gap?: number | string;
  className?: string;
}

const Grid: React.FC<GridProps> = ({
  children,
  columns = 12,
  gap = 4,
  className = ''
}) => {
  const getGridColumns = () => {
    if (typeof columns === 'number') {
      return `grid-cols-${columns}`;
    }

    return Object.entries(columns)
      .map(([breakpoint, cols]) => `${breakpoint}:grid-cols-${cols}`)
      .join(' ');
  };

  return (
    <div
      className={`
        grid
        ${getGridColumns()}
        gap-${gap}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Grid;
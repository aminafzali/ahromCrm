import React from 'react';

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  children,
  className = '',
  elevated = false,
}) => {
  return (
    <div className={`
      navbar bg-base-100 
      ${elevated ? 'shadow-md' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Toolbar;
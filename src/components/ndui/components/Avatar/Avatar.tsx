import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  placeholder?: React.ReactNode;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  shape = 'circle',
  placeholder,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`
      avatar ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
      ${sizeClasses[size]}
      ${className}
    `}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="bg-base-300 w-full h-full flex items-center justify-center">
          {placeholder || alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default Avatar;
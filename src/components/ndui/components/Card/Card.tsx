import React from "react";

interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  classNameBody?: string;
  classNameTitle?: string;
  classNameActions?: string;
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  className = "",
  classNameTitle = "",
  classNameBody = "",
  classNameActions = "",
  elevated = false,
}) => {
  return (
    <div
      className={`card !p-2 bg-white  ${className} ${
        elevated ? "shadow-xl" : "border-2"
      }`}
    >
      {title && <div className={`card-title ${classNameTitle}`}>{title}</div>}
      <div className={`${classNameBody}`}>{children}</div>
      {footer && (
        <div className={`card-actions p-2 border-t-2 ${classNameActions}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

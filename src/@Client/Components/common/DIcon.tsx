import React from "react";

interface NavLinkProps {
  icon: string;
  className?: string;
  classCustom?: string;
  cdi?: boolean;
}

const DIcon: React.FC<NavLinkProps> = ({
  icon,
  className = "",
  classCustom = "",
  cdi = true,
}) => {
  return (
    <>
      <i
        className={` ${
          cdi ? "custom-duotone-icon text-primary" : ""
        }  fa-light  ${icon} ${classCustom} ${className}  mx-1 `}
      ></i>
    </>
  );
};

export default DIcon;

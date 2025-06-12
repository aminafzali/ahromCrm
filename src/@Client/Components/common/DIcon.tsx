import React from "react";

interface NavLinkProps {
  
  icon: string;
  classCustom?: string;
  cdi?: boolean;
}

const DIcon: React.FC<NavLinkProps> = ({  icon, classCustom = "" , cdi=true }) => {
  return (
    <>
      <i className={` ${cdi ? 'custom-duotone-icon text-primary' : ''}  fa-light  ${icon} ${classCustom}  mx-1 `}></i>
    </>
  );
}

export default DIcon;

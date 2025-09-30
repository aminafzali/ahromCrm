// src/components/LoginButton.tsx
import Link from "next/link";
import React from "react";
// import Image from "next/image";
// import ahrom from "../../../public/logo/ahrom.png";

const LogoWithTitle: React.FC = () => {
  return (
    <Link
      href="/"
      className="flex font-bold text-black text-lg opacity-80 hover:opacity-100"
    >
      {/* <img src={ahrom} alt="لگوی سایت" width={24} height={24} /> */}
      <div className="mx-2 mt-1">سامانه خدمات اهرم</div>
    </Link>
  );
};

export default LogoWithTitle;

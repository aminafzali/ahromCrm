"use client";

import { Breadcrumbs } from "ndui-ahrom";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href: string;
}

interface BreadCrumbsWrapperProps {
  menuItems: MenuItem[];
}

const BreadCrumbsWrapper: React.FC<BreadCrumbsWrapperProps> = ({
  menuItems,
}) => {
  const pathName = usePathname();
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [];
    let pathlink = "";

    pathName
      ?.split("/")
      .filter((path) => path) // حذف مقادیر خالی
      .forEach((path) => {
        pathlink += `/${path}`;

        // جستجوی آیتم مربوط به مسیر فعلی در منو
        const menuItem = menuItems.find((item) => item.href === pathlink);

        items.push({
          label: menuItem?.label || path,
          href: pathlink,
          icon: menuItem?.icon,
        });
      });

    return items;
  }, [pathName]);

  return (
    <div>
      {breadcrumbs.length > 0 && (
        <div className="max-sm:mb-4">
          <Breadcrumbs
            separator="aaa"
            className="md:!text-lg text-primary "
            items={breadcrumbs}
          />
        </div>
      )}
    </div>
  );
};

export default BreadCrumbsWrapper;

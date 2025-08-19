"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import BottomBar from "../BottomBar/BottomBar";
import Toolbar from "../Toolbar/Toolbar";

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
  active?: boolean;
  divider?: boolean;
}

interface LayoutWrapperProps {
  children: React.ReactNode;
  drawerHeader?: React.ReactNode;
  drawerFooter?: React.ReactNode;
  drawerMenuItems?: MenuItem[];
  showDrawer?: boolean;
  miniDrawer?: boolean;
  drawerWidth?: string;
  classNameToolbar?: string;
  miniDrawerWidth?: string;
  toolbarContent?: React.ReactNode;
  showToolbar?: boolean;
  elevatedToolbar?: boolean;
  bottomBarItems?: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    badge?: number | string;
    href: string;
  }[];
  showBottomBar?: boolean;
  bottomBarValue?: string;
  onBottomBarChange?: (value: string) => void;
  className?: string;
  bgColor?: string;
  activeClass?: string;
  hoverClass?: string;
  breakpoint?: number;
  rtl?: boolean;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  drawerHeader,
  drawerFooter,
  drawerMenuItems = [],
  showDrawer = true,
  miniDrawer = false,
  drawerWidth = "256px",
  miniDrawerWidth = "60px",
  bgColor = "bg-white",
  activeClass = "bg-base-200",
  hoverClass = "bg-base-100",
  toolbarContent,
  showToolbar = true,
  elevatedToolbar = true,
  bottomBarItems,
  showBottomBar = true,
  className = "",
  classNameToolbar = "",
  breakpoint = 1024,
  rtl = false,
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [expandedMenuItems, setExpandedMenuItems] = useState<string[]>([]);
  const pathName = usePathname();

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => window.removeEventListener("resize", checkIsDesktop);
  }, [breakpoint]);

  const mainContentStyle =
    isDesktop && isDrawerOpen
      ? {
          [rtl ? "marginRight" : "marginLeft"]: miniDrawer
            ? miniDrawerWidth
            : drawerWidth,
        }
      : {};

  const toggleMenuItem = (itemId: string) => {
    setExpandedMenuItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenuItems.includes(item.id);
    if (item.divider) {
      return (
        <li key={item.id} className="divider divider-start">
          {item.label}
        </li>
      );
    }

    const itemContent = (
      <div
        className={`
          flex items-center gap-3 py-2 px-4 rounded 
          ${pathName === item.href ? `${activeClass}` : `hover:${hoverClass}`} 
          
          transition-colors cursor-pointer
          ${level > 0 ? "mr-4 " : ""}
        `}
      >
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}

        {(!miniDrawer || !isDesktop || !isDrawerOpen) && (
          <span className="truncate">{item.label}</span>
        )}
      </div>
    );

    const itemContentWithChildren = (
      <div
        className={`
          flex items-center gap-3 py-2 px-4 rounded 
          transition-colors cursor-pointer
          ${isExpanded && item.children && `bg-gray-200`} 
          ${level > 0 ? "mr-2" : ""}
        `}
        onClick={() => {
          toggleMenuItem(item.id);
        }}
      >
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}

        {(!miniDrawer || !isDesktop || !isDrawerOpen) && (
          <span className="truncate ">{item.label}</span>
        )}

        {hasChildren && !miniDrawer && (
          <span className={`${rtl ? "mr-auto" : "ml-auto"}`}>
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
      </div>
    );

    return (
      <li key={item.id}>
        {item.href ? (
          <Link href={item.href} className="block">
            {itemContent}
          </Link>
        ) : (
          itemContentWithChildren
        )}

        {hasChildren && isExpanded && !miniDrawer && (
          <ul className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  const renderDrawerContent = () => (
    <aside className={`w-full ${bgColor} h-full flex flex-col`}>
      {drawerHeader && (
        <div
          className={`p-4 ${
            miniDrawer && isDesktop && isDrawerOpen ? "flex justify-center" : ""
          }`}
        >
          {drawerHeader}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 p-2">
          {drawerMenuItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>

      {drawerFooter && (
        <div
          className={`p-4 mt-auto ${
            miniDrawer && isDesktop && isDrawerOpen ? "flex justify-center" : ""
          }`}
        >
          {drawerFooter}
        </div>
      )}
    </aside>
  );

  return (
    <div className={`min-h-screen ${rtl ? "rtl" : "ltr"}`}>
      {/* Fixed Desktop Drawer */}
      {showDrawer && isDesktop && (
        <div
          className={`fixed print:hidden top-0 ${
            rtl ? "right-0" : "left-0"
          } h-full transition-all duration-300`}
          style={{
            width: isDrawerOpen
              ? miniDrawer
                ? miniDrawerWidth
                : drawerWidth
              : "0px",
            contentVisibility: "auto",
            transform: isDrawerOpen
              ? "translateX(0)"
              : `translateX(${rtl ? "100%" : "-100%"})`,
          }}
        >
          <div
            className={`h-full bg-white ${
              rtl ? "border-l" : "border-r"
            } border-base-300`}
          >
            {renderDrawerContent()}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {showDrawer && !isDesktop && (
        <div
          className={`
            fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
            ${
              isMobileDrawerOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }
          `}
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            className={`
              fixed top-0 ${
                rtl ? "right-0" : "left-0"
              } h-full bg-white transition-transform duration-300
              ${
                isMobileDrawerOpen
                  ? "translate-x-0"
                  : rtl
                  ? "translate-x-full"
                  : "-translate-x-full"
              }
            `}
            style={{ width: drawerWidth }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderDrawerContent()}
          </div>
        </div>
      )}

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${className}`}
        style={mainContentStyle}
      >
        {/* Toolbar */}
        {showToolbar && (
          <Toolbar elevated={elevatedToolbar} className={`${classNameToolbar}`}>
            {showDrawer && (
              <>
                {/* Mobile menu button */}
                {!isDesktop && (
                  <button
                    className="btn btn-ghost"
                    onClick={() => setIsMobileDrawerOpen(true)}
                  >
                    ☰
                  </button>
                )}
                {/* Desktop drawer toggle */}
                {isDesktop && (
                  <button
                    className="btn btn-ghost"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                  >
                    ☰
                  </button>
                )}
              </>
            )}
            {toolbarContent}
          </Toolbar>
        )}

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Bottom Bar */}
        {showBottomBar && bottomBarItems && !isDesktop && (
          <BottomBar items={bottomBarItems} />
        )}
      </div>
    </div>
  );
};

export default LayoutWrapper;

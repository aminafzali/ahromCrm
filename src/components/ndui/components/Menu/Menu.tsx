import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

interface MenuItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  divider?: boolean;
  customRender?: () => React.ReactNode;
}

interface MenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  position?: "left" | "right";
}

const Menu: React.FC<MenuProps> = ({ trigger, items, position = "right" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`dropdown ${position === "right" ? "dropdown-end" : ""}`}
      ref={menuRef}
    >
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <ul
          className={`menu dropdown-content bg-white rounded-box z-50 mt-2 w-52 p-2 shadow-lg`}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.divider ? (
                <div className="my-2 border-t border-base-300" />
              ) : (
                <li>
                  {item.customRender ? (
                    item.customRender()
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      className="w-full flex items-center gap-2 p-3 rounded-md hover:bg-base-300"
                    >
                      {item.icon && <span>{item.icon}</span>}
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className="w-full flex items-center gap-2 p-3 rounded-md hover:bg-base-300"
                      onClick={() => {
                        if (!item.disabled) {
                          item.onClick?.();
                          setIsOpen(false);
                        }
                      }}
                      disabled={item.disabled}
                    >
                      {item.icon && <span>{item.icon}</span>}
                      {item.label}
                    </button>
                  )}
                </li>
              )}
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Menu;

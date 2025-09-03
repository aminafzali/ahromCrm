// // // مسیر فایل: src/@Client/Components/wrappers/V2/MultiSelectFilter.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Option {
  value: string | number;
  label: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}

// کامپوننت منوی بازشونده که با پورتال رندر می‌شود
const DropdownMenu: React.FC<any> = ({
  options,
  selectedValues,
  handleOptionClick,
  menuPosition,
  menuRef, // <-- ۱. دریافت ref برای منو
}) => {
  if (!menuPosition) return null;

  return createPortal(
    <div
      ref={menuRef} // <-- ۲. اتصال ref به div اصلی منو
      style={{
        position: "absolute",
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        width: `${menuPosition.width}px`,
      }}
      className="origin-top-right mt-2 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
    >
      <div
        className="py-1 max-h-60 overflow-y-auto"
        role="menu"
        aria-orientation="vertical"
      >
        {options.map(
          (option: Option) =>
            String(option.value) !== "all" && (
              <a
                key={String(option.value)}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleOptionClick(option.value);
                }}
                className="flex items-center justify-between text-gray-700 dark:text-gray-200 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <span>{option.label}</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={selectedValues.includes(String(option.value))}
                  readOnly
                />
              </a>
            )
        )}
      </div>
    </div>,
    document.body
  );
};

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  label,
  options,
  selectedValues,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null); // تغییر نام ref برای وضوح بیشتر
  const menuRef = useRef<HTMLDivElement>(null); // ref جدید برای منو
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
      setIsOpen(true);
    }
  };

  const handleOptionClick = (value: string | number) => {
    const stringValue = String(value);
    const newSelectedValues = selectedValues.includes(stringValue)
      ? selectedValues.filter((v) => v !== stringValue)
      : [...selectedValues, stringValue];
    onChange(newSelectedValues);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // ===== ۳. اصلاح منطق: اگر کلیک خارج از دکمه "و" خارج از منو بود، آن را ببند =====
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // <-- حذف dependency ها برای جلوگیری از re-attach شدن مکرر

  const selectedCount = selectedValues.length;

  return (
    <div className="relative inline-block text-left w-full" ref={buttonRef}>
      <div>
        <button
          type="button"
          onClick={handleToggle}
          className="py-4 inline-flex items-center justify-between w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-4 text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all"
        >
          <div className="flex items-center gap-x-2">
            <span>{label}</span>
            {selectedCount > 0 && (
              <span className="text-xs font-mono bg-slate-200 dark:bg-slate-500 text-slate-600 dark:text-slate-100 rounded-full px-2 py-0.5">
                {selectedCount}
              </span>
            )}
          </div>
          <DIcon
            icon={`fa-chevron-${isOpen ? "up" : "down"}`}
            classCustom="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400"
          />
        </button>
      </div>

      {isOpen && (
        <DropdownMenu
          options={options}
          selectedValues={selectedValues}
          handleOptionClick={handleOptionClick}
          menuPosition={menuPosition}
          menuRef={menuRef}
        />
      )}
    </div>
  );
};

export default MultiSelectFilter;

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import React, { useEffect, useRef, useState } from "react";

// interface Option {
//   value: string | number;
//   label: string;
// }

// interface MultiSelectFilterProps {
//   label: string;
//   options: Option[];
//   selectedValues: string[];
//   onChange: (selected: string[]) => void;
// }

// const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
//   label,
//   options,
//   selectedValues,
//   onChange,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const wrapperRef = useRef<HTMLDivElement>(null);

//   const handleToggle = () => setIsOpen(!isOpen);

//   const handleOptionClick = (value: string | number) => {
//     const stringValue = String(value);
//     const newSelectedValues = selectedValues.includes(stringValue)
//       ? selectedValues.filter((v) => v !== stringValue)
//       : [...selectedValues, stringValue];
//     onChange(newSelectedValues);
//   };

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         wrapperRef.current &&
//         !wrapperRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [wrapperRef]);

//   const selectedCount = selectedValues.length;

//   return (
//     <div className="relative inline-block text-left w-full" ref={wrapperRef}>
//       <div>
//         <button
//           type="button"
//           onClick={handleToggle}
//           className="py-4 inline-flex items-center justify-between w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-4 text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all"
//         >
//           <div className="flex items-center gap-x-2">
//             <span>{label}</span>
//             {selectedCount > 0 && (
//               <span className="text-xs font-mono bg-slate-200 dark:bg-slate-500 text-slate-600 dark:text-slate-100 rounded-full px-2 py-0.5">
//                 {selectedCount}
//               </span>
//             )}
//           </div>
//           <DIcon
//             icon={`fa-chevron-${isOpen ? "up" : "down"}`}
//             classCustom="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400"
//           />
//         </button>
//       </div>

//       {isOpen && (
//         // ===== شروع اصلاحیه =====
//         <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
//           {/* ===== پایان اصلاحیه ===== */}
//           <div
//             className="py-1 max-h-60 overflow-y-auto"
//             role="menu"
//             aria-orientation="vertical"
//           >
//             {options.map(
//               (option) =>
//                 String(option.value) !== "all" && (
//                   <a
//                     key={String(option.value)}
//                     href="#"
//                     onClick={(e) => {
//                       e.preventDefault();
//                       handleOptionClick(option.value);
//                     }}
//                     className="flex items-center justify-between text-gray-700 dark:text-gray-200 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
//                     role="menuitem"
//                   >
//                     <span>{option.label}</span>
//                     <input
//                       type="checkbox"
//                       className="checkbox checkbox-primary checkbox-sm"
//                       checked={selectedValues.includes(String(option.value))}
//                       readOnly
//                     />
//                   </a>
//                 )
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MultiSelectFilter;

// // "use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import React, { useEffect, useRef, useState } from "react";

// // interface Option {
// //   value: string | number;
// //   label: string;
// // }

// // interface MultiSelectFilterProps {
// //   label: string;
// //   options: Option[];
// //   selectedValues: string[];
// //   onChange: (selected: string[]) => void;
// // }

// // const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
// //   label,
// //   options,
// //   selectedValues,
// //   onChange,
// // }) => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const wrapperRef = useRef<HTMLDivElement>(null);

// //   const handleToggle = () => setIsOpen(!isOpen);

// //   const handleOptionClick = (value: string | number) => {
// //     const stringValue = String(value);
// //     const newSelectedValues = selectedValues.includes(stringValue)
// //       ? selectedValues.filter((v) => v !== stringValue)
// //       : [...selectedValues, stringValue];
// //     onChange(newSelectedValues);
// //   };

// //   useEffect(() => {
// //     function handleClickOutside(event: MouseEvent) {
// //       if (
// //         wrapperRef.current &&
// //         !wrapperRef.current.contains(event.target as Node)
// //       ) {
// //         setIsOpen(false);
// //       }
// //     }
// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, [wrapperRef]);

// //   const selectedCount = selectedValues.length;

// //   return (
// //     <div className="relative inline-block text-left w-full" ref={wrapperRef}>
// //       <div>
// //         {/* ===== شروع اصلاحیه ظاهر دکمه ===== */}
// //         <button
// //           type="button"
// //           onClick={handleToggle}
// //           className="py-4 inline-flex items-center justify-between w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-4 text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all"
// //         >
// //           <div className="flex items-center gap-x-2">
// //             <span>{label}</span>
// //             {selectedCount > 0 && (
// //               <span className="text-xs font-mono bg-slate-200 dark:bg-slate-500 text-slate-600 dark:text-slate-100 rounded-full px-2 py-0.5">
// //                 {selectedCount}
// //               </span>
// //             )}
// //           </div>
// //           <DIcon
// //             icon={`fa-chevron-${isOpen ? "up" : "down"}`}
// //             classCustom="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400"
// //           />
// //         </button>
// //         {/* ===== پایان اصلاحیه ظاهر دکمه ===== */}
// //       </div>

// //       {isOpen && (
// //         <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
// //           <div
// //             className="py-1 max-h-60 overflow-y-auto"
// //             role="menu"
// //             aria-orientation="vertical"
// //           >
// //             {options.map(
// //               (option) =>
// //                 String(option.value) !== "all" && (
// //                   <a
// //                     key={String(option.value)}
// //                     href="#"
// //                     onClick={(e) => {
// //                       e.preventDefault();
// //                       handleOptionClick(option.value);
// //                     }}
// //                     className="flex items-center justify-between text-gray-700 dark:text-gray-200 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
// //                     role="menuitem"
// //                   >
// //                     <span>{option.label}</span>
// //                     <input
// //                       type="checkbox"
// //                       className="checkbox checkbox-primary checkbox-sm"
// //                       checked={selectedValues.includes(String(option.value))}
// //                       readOnly
// //                     />
// //                   </a>
// //                 )
// //             )}
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default MultiSelectFilter;

// مسیر فایل: src/modules/payment-categories/components/PaymentCategorySelect2.tsx

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePaymentCategory } from "../hooks/usePaymentCategory";
import { PaymentCategoryWithRelations, TreeNode } from "../types";

// --- Type Definitions ---
interface SelectOption {
  value: number;
  label: string;
  disabled: boolean;
}

interface PaymentCategorySelectProps {
  name: string;
  label: string;
  value?: number;
  onChange: (event: { target: { value: string } }) => void;
  placeholder?: string;
}

// --- SVG Icons ---
const ChevronUpDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-gray-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
    />
  </svg>
);
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const PaymentCategorySelect2: React.FC<PaymentCategorySelectProps> = ({
  name,
  label,
  value,
  onChange,
  placeholder = "یک دسته را انتخاب کنید...",
}) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { getAll, loading } = usePaymentCategory();
  const selectRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    const fetchAndProcessCategories = async () => {
      // این متد بدون مرتب‌سازی فراخوانی می‌شود تا با خطای سرور مواجه نشود
      const res = await getAll({ page: 1, limit: 1000 }).catch(console.error);
      if (res?.data) {
        setOptions(flattenTree(buildTree(res.data)));
      }
    };
    fetchAndProcessCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // توابع ساخت و مسطح‌سازی درخت بدون تغییر
  const buildTree = (items: PaymentCategoryWithRelations[]): TreeNode[] => {
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];
    items.forEach((item) => map.set(item.id, { ...item, children: [] }));
    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId) map.get(item.parentId)?.children?.push(node);
      else roots.push(node);
    });
    return roots;
  };

  const flattenTree = (nodes: TreeNode[], level = 0): SelectOption[] => {
    return nodes.reduce((acc, node) => {
      const isParent = !!node.children?.length;
      acc.push({
        value: node.id,
        label: `${"— ".repeat(level)}${node.name}`,
        disabled: isParent,
      });
      if (isParent && node.children)
        acc.push(...flattenTree(node.children, level + 1));
      return acc;
    }, [] as SelectOption[]);
  };

  // این منطق برای سازگاری با کد شما بدون تغییر باقی می‌ماند
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange({ target: { value: String(option.value) } });
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = searchTerm
    ? options.filter(
        (opt) =>
          opt.label.trim().toLowerCase().includes(searchTerm.toLowerCase()) &&
          !opt.disabled
      )
    : options;

  return (
    <div className="w-full mt-1 p-1" ref={selectRef}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
      >
        {label}
      </label>
      <div className="relative mt-1">
        <button
          type="button"
          id={inputId}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full cursor-default rounded-lg bg-gray-100 dark:bg-slate-900 py-3 pl-10 pr-3 text-right ring-1 ring-inset ring-slate-400 dark:ring-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
        >
          <span
            className={`block truncate ${
              selectedOption ? "text-gray-900 dark:text-white" : "text-gray-400"
            }`}
          >
            {selectedOption ? selectedOption.label.trim() : placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
            <ChevronUpDownIcon />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <div className="p-2">
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 px-3 bg-gray-100 dark:bg-gray-700 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <ul>
              {loading ? (
                <li className="text-gray-500 text-center py-2">
                  در حال بارگذاری...
                </li>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`
                      relative cursor-default select-none py-2 pr-9 pl-3
                      ${
                        option.disabled
                          ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "text-gray-900 dark:text-gray-200 hover:bg-teal-600 hover:text-white"
                      }
                      ${
                        value === option.value && !option.disabled
                          ? "bg-teal-600 text-white"
                          : ""
                      }
                    `}
                  >
                    <span
                      className={`block truncate ${
                        value === option.value ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {option.label}
                    </span>
                    {value === option.value && !option.disabled && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-teal-600 hover:text-white">
                        <CheckIcon />
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <li className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  نتیجه‌ای یافت نشد.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCategorySelect2;

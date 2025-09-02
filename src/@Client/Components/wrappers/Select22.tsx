import React, { useEffect, useRef, useState } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  options: Option[];
  name: string;
  placeholder?: string;
  renderOption?: (option: Option) => React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const Select22: React.FC<SelectProps> = ({
  name,
  label,
  options,
  renderOption,
  size = "md",
  className = "",
  placeholder = "",
  value: controlledValue,
  defaultValue,
  onChange,
  ...props
}) => {
  const isControlled = controlledValue !== undefined;
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const [internalValue, setInternalValue] = useState<string>(
    () => (defaultValue ?? "") as string
  );
  const [search, setSearch] = useState(""); // 🔍 جستجو
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const selectedValue =
    (isControlled ? (controlledValue as string) : internalValue) || "";

  const selectedOption = options.find(
    (o) => String(o.value) === String(selectedValue)
  );

  // فیلتر کردن بر اساس سرچ
  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      const idx = filteredOptions.findIndex(
        (o) => String(o.value) === String(selectedValue)
      );
      setHighlight(idx >= 0 ? idx : 0);
      setTimeout(() => {
        listRef.current?.focus();
      }, 0);
    } else {
      setHighlight(-1);
      setSearch(""); // وقتی بسته شد سرچ ریست بشه
    }
  }, [open, selectedValue, filteredOptions]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const triggerOnChange = (val: string) => {
    if (onChange) {
      const fakeEvent = {
        target: { name, value: val },
        currentTarget: { name, value: val },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(fakeEvent);
    }
  };

  const handleSelect = (val: string) => {
    if (!isControlled) setInternalValue(val);
    triggerOnChange(val);
    setOpen(false);
  };

  const onKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && highlight < filteredOptions.length) {
        handleSelect(String(filteredOptions[highlight].value));
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const hiddenSelectStyle: React.CSSProperties = {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
    height: 0,
    width: 0,
  };

  const sizeClass =
    size === "xs"
      ? "py-1 px-2 text-sm"
      : size === "sm"
      ? "py-1.5 px-3 text-sm"
      : size === "lg"
      ? "py-3.5 px-4 text-sm"
      : "py-3.5 px-3 text-sm";

  return (
    <div className="form-control w-full" ref={wrapperRef}>
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}

      <select
        name={name}
        value={selectedValue}
        onChange={(e) => {
          if (!isControlled) setInternalValue(e.target.value);
          triggerOnChange(e.target.value);
        }}
        style={hiddenSelectStyle}
        aria-hidden
        tabIndex={-1}
      >
        <option value="">{placeholder ?? ""}</option>
        {options.map((opt) => (
          <option key={opt.value} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className={`relative ${className}`} {...(props as any)}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
          className={`w-full flex items-center justify-between border border-gray-300 bg-gray-100 rounded-lg shadow-sm ${sizeClass} pr-3 pl-3 transition-colors ${
            open ? "outline outline-2 outline-teal-600" : ""
          } focus:outline-2 focus:outline-teal-600 focus:border-none`}
        >
          <span
            className={`${
              selectedOption ? "text-gray-900 text-sm" : "text-gray-400 text-sm"
            }`}
          >
            {selectedOption
              ? selectedOption.label
              : placeholder || "یک گزینه انتخاب کنید"}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transform transition-transform ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M6 9l6 6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
            {/* سرچ فقط وقتی آیتم > 5 */}
            {options.length > 5 && (
              <div className="p-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو..."
                  className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            )}

            <ul
              role="listbox"
              tabIndex={0}
              ref={listRef}
              onKeyDown={onKeyDownList}
              className={`text-sm overflow-auto ${
                filteredOptions.length > 5 ? "max-h-60" : "max-h-none"
              }`}
              style={{ scrollbarGutter: "stable" }}
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-gray-400">یافت نشد</li>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected =
                    String(opt.value) === String(selectedValue);
                  const isHighlighted = idx === highlight;
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => handleSelect(String(opt.value))}
                      className={`px-3 py-2 cursor-pointer select-none transition-colors
                        ${isSelected ? "bg-teal-600 text-white" : ""}
                        ${
                          !isSelected && isHighlighted
                            ? "bg-teal-100 text-teal-800"
                            : ""
                        }
                        ${
                          !isSelected && !isHighlighted
                            ? "hover:bg-gray-100 text-gray-700"
                            : ""
                        }`}
                    >
                      {renderOption ? renderOption(opt) : opt.label}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        ul::-webkit-scrollbar {
          width: 8px;
        }
        ul::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.12);
          border-radius: 999px;
        }
        ul::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default Select22;

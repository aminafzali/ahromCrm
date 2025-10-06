// مسیر فایل: src/modules/document-categories/components/DocumentCategorySelect.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useDocumentCategory } from "../hooks/useDocumentCategory";

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  name: string;
  label: string;
  value?: string;
  onChange: (event: { target: { value: string } }) => void;
  placeholder?: string;
}

export default function DocumentCategorySelect({
  name,
  label,
  value,
  onChange,
  placeholder = "یک دسته را انتخاب کنید...",
}: Props) {
  const { getAll, loading } = useDocumentCategory();
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    const fetchCats = async () => {
      const res = await getAll({ page: 1, limit: 1000 }).catch(() => null);
      const list = res?.data || [];
      const opts: SelectOption[] = [
        { value: "", label: placeholder },
        ...list.map((c: any) => ({ value: String(c.id), label: c.name })),
      ];
      setOptions(opts);
    };
    fetchCats();
  }, [getAll, placeholder]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const current = options.find((o) => o.value === value);

  return (
    <div className="w-full" ref={wrapRef}>
      <label htmlFor={inputId} className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <button
        id={inputId}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full bg-gray-100 py-3 px-3 rounded-md text-right ring-1 ring-slate-300 hover:ring-slate-400"
      >
        <span
          className={`truncate ${
            current ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {current ? current.label : placeholder}
        </span>
      </button>
      {isOpen && (
        <div className="mt-1 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
          <div className="p-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو..."
              className="input input-bordered w-full"
            />
          </div>
          <ul>
            {loading ? (
              <li className="py-2 px-3 text-slate-500">در حال بارگذاری...</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-teal-600 hover:text-white ${
                    opt.value === value ? "bg-teal-600 text-white" : ""
                  }`}
                  onClick={() => {
                    onChange({ target: { value: String(opt.value) } });
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

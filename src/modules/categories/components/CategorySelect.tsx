import { Select } from "ndui-ahrom";
import React from "react";
import { CategoryWithRelations } from "../types";

interface CategorySelectProps {
  categories: CategoryWithRelations[];
  value?: string | number;
  onChange: (value: string) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  value,
  onChange,
  name = "category",
  label = "دسته‌بندی",
  placeholder = "انتخاب دسته‌بندی",
  disabled = false,
  required = false,
  error,
}) => {
  const buildOptions = (cats: CategoryWithRelations[], depth = 0): any[] => {
    return cats.reduce((acc: any[], cat) => {
      // Add current category
      acc.push({
        value: cat.id.toString(),
        label: "  ".repeat(depth) + cat.name,
      });

      // Add children recursively
      if (cat.children && cat.children.length > 0) {
        acc.push(...buildOptions(cat.children, depth + 1));
      }

      return acc;
    }, []);
  };

  const options = [
    { value: "", label: placeholder },
    ...buildOptions(categories.filter((cat) => !cat.parentId)),
  ];

  return (
    <Select
      name={name}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      disabled={disabled}
      required={required}
    />
  );
};

export default CategorySelect;

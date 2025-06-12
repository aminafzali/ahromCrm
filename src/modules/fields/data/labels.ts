const options = [
  { value: "text", label: "متن" },
  { value: "number", label: "عدد" },
  { value: "boolean", label: "چک‌باکس" },
  { value: "select", label: "انتخابی" },
  { value: "multi_select", label: "انتخاب چندگانه" },
  { value: "date", label: "تاریخ" },
  { value: "file", label: "فایل" },
];

export const getLabelByValue = (value) => {
  const option = options.find((item) => item.value === value);
  return option ? option.label : "نامشخص"; // Return null if not found
};

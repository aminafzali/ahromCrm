export const tops = [
  "price",
  "color",
  "basePrice",
  "status",
  "category",
  "parent",
  "serviceType",
  "brand",
  "stock",
  "phone",
  "isActive",
  "createdAt",
  "updatedAt",
];
export const ignore = [
  "categoryId",
  "warrantyId",
  "parentId",
  "brandId",
  "serviceTypeId",
  "statusId",
  "name",
  "phone",
  "blog",
  "basePrice",
  "parent",
  "ـcount",
];

export const getContrastTextColor = (bgColor: string): string => {
  if (!bgColor) return "#000";
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
};

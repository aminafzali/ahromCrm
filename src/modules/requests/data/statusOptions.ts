export const requestStatusOptions = [
  { value: "در انتظار بررسی", label: "در انتظار بررسی" },
  { value: "در حال انجام", label: "در حال انجام" },
  { value: "تکمیل شده", label: "تکمیل شده" },
  { value: "لغو شده", label: "لغو شده" },
];

export const getStatusLabel = (status: string): string => {
  const option = requestStatusOptions.find((opt) => opt.value === status);
  return option ? option.label : status;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "در انتظار بررسی":
      return "warning";
    case "در حال انجام":
      return "info";
    case "تکمیل شده":
      return "success";
    case "لغو شده":
      return "error";
    default:
      return "neutral";
  }
};
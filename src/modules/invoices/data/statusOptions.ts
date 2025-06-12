// Status options for invoices
export const invoiceStatusOptions = [
  { value: "در انتظار پرداخت" , label: "در انتظار پرداخت" },
  { value: "پرداخت شده", label: "پرداخت شده" },
  { value: "لغو شده", label: "لغو شده" },
];

// Get status label by value
export const getStatusLabel = (status: string): string => {
  const option = invoiceStatusOptions.find((opt) => opt.value === status);
  return option ? option.label : status;
};

// Get status color by value
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "warning";
    case "paid":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "neutral";
  }
};

import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns-jalali";
import { enUS, faIR } from "date-fns/locale";

interface DateDisplayProps {
  date: string | number | Date; // پشتیبانی از رشته، عدد (تایم‌استمپ) و Date
  size?: "xs" | "sm" | "md" | "lg"; // پشتیبانی از رشته، عدد (تایم‌استمپ) و Date
  className?: string; // پشتیبانی از رشته، عدد (تایم‌استمپ) و Date
  locale?: "fa" | "en"; // انتخاب زبان (پیش‌فرض: فارسی)
  customFormat?:
    | "yyyy/MM/dd HH:mm"
    | "dd MMM yyyy"
    | "yyyy-MM-dd"
    | "dd/MM/yyyy"
    | "MMM dd, yyyy HH:mm"
    | "EEEE, dd MMMM yyyy"; // فرمت‌های موجود برای نمایش تاریخ
  showTooltip?: boolean; // آیا Tooltip نمایش داده شود؟ (پیش‌فرض: true)
  short?: boolean; // آیا Tooltip نمایش داده شود؟ (پیش‌فرض: true)
}

const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  size = "sm",
  className,
  locale = "fa",
  customFormat = "yyyy/MM/dd HH:mm",
  showTooltip = true,
  short = true,
}) => {
  if (!date) return null;

  const parsedDate = new Date(date);
  const selectedLocale = locale === "fa" ? faIR : enUS;
  const now = new Date();
  const diffInHours = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60);

  let formattedDate;
  if (diffInHours < 1 && short) {
    formattedDate = formatDistanceToNow(parsedDate, {
      locale: selectedLocale,
      addSuffix: true,
    });
  } else if (diffInHours < 24 && short) {
    formattedDate = formatDistanceToNow(parsedDate, {
      locale: selectedLocale,
      addSuffix: true,
    });
  } else {
    formattedDate = format(parsedDate, customFormat);
  }

  return (
    <span
      className={`text-gray-600 ${className} text-${size}`}
      title={
        showTooltip && diffInHours < 24
          ? format(parsedDate, "yyyy/MM/dd HH:mm", { locale: selectedLocale })
          : ""
      }
    >
      {formattedDate}
    </span>
  );
};

export default DateDisplay;

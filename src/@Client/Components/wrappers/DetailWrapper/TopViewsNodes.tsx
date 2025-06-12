import { ReactNode } from "react";
import DIcon from "../../common/DIcon";
import DateDisplay from "../../DateTime/DateDisplay";

export const InfoBox: React.FC<{
  icon?: string;
  text: string | ReactNode;
  className?: string;
}> = ({ icon, text, className }) => (
  <span
    className={`w-full flex justify-center bg-white rounded-xl border border-gray-300 p-4 gap-2 ${
      className || ""
    }`}
  >
    {icon && <DIcon icon={icon} cdi={false} classCustom="text-xl" />}
    {text}
  </span>
);

export const PhoneBox: React.FC<{ phone: string }> = ({ phone }) => (
  <div className="flex justify-center p-4 col-span-2 w-full rounded-lg bg-primary text-white">
    <a href={`tel:${phone}`} className="flex items-center text-white text-lg">
      شماره تماس : {phone || "نامشخص"}
      <DIcon
        icon="fa-phone"
        cdi={false}
        classCustom="!mx-2 text-white text-xl"
      />
    </a>
  </div>
);

export const DateBox: React.FC<{
  icon?: string;
  label: string;
  date?: string;
}> = ({ icon = "fa-calendar-alt", label, date }) => (
  <InfoBox
    text={
      <>
        <span className="text-sm text-gray-500">{label}:</span>{" "}
        {date ? <DateDisplay date={date} /> : "ندارد"}
      </>
    }
    className="col-span-2 flex justify-between"
  />
);

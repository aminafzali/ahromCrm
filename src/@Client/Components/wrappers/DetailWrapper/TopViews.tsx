import React from "react";
import { useTranslation } from "react-i18next";
import DIcon from "../../common/DIcon";
import StatusBadge from "../../common/StatusBadge";
import { DateBox, InfoBox, PhoneBox } from "./TopViewsNodes";
import { getContrastTextColor, tops } from "./views";

interface TopViewsProps {
  data: Record<string, any>;
}

const TopViews: React.FC<TopViewsProps> = ({ data }) => {
  const { t } = useTranslation();

  const renderView = (key: string, value: any, index: number) => {
    switch (key) {
      case "phone":
        return <PhoneBox key={index} phone={value} />;

      case "status":
      case "color":
        return typeof value === "object" && value !== null ? (
          <span
            key={index}
            className="p-2 col-span-2 rounded-xl py-3 flex justify-center items-center"
            style={{
              background: value.color || value,
              color: getContrastTextColor(value.color || value),
            }}
          >
            <DIcon icon="fa-octagon-check" cdi={false} classCustom="text-xl" />
            {value?.name || value || "ندارد"}
          </span>
        ) : (
          <span key={index} className="col-span-2 w-full flex ">
            <StatusBadge
              status={value}
              className="py-3  rounded-xl w-full text-center"
            />
          </span>
        );
      case "price":
      case "basePrice":
        return (
          <InfoBox
            key={index}
            icon="fa-dollar-sign"
            text={`${value} تومان`}
            className="col-span-2"
          />
        );
      case "stock":
        return (
          <InfoBox
            key={index}
            icon="fa-hashtag"
            text={value > 0 ? `${value} عدد ` : "ناموجود"}
            className={value > 0 ? "text-primary" : "text-error"}
          />
        );
      case "category":
      case "parent":
      case "serviceType":
      case "brand":
        return (
          <InfoBox
            key={index}
            icon={key === "brand" ? "fa-copyright" : "fa-code-branch"}
            text={t(key) + " : " + value?.name || "ندارد"}
            className="col-span-2"
          />
        );
      case "isActive":
        return (
          <InfoBox
            key={index}
            icon={value ? "fa-badge-check" : "fa-circle-xmark"}
            text={value ? "فعال" : "غیرفعال"}
            className={
              value
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            }
          />
        );
      case "createdAt":
        return <DateBox key={index} label="ایجاد در" date={value} />;
      case "updatedAt":
        return <DateBox key={index} label="به روز رسانی" date={value} />;

      default:
        return (
          <span key={index} className="text-gray-700">
            {String(value)}
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {tops.map(
        (key, index) =>
          data[key] !== undefined && renderView(key, data[key], index)
      )}
    </div>
  );
};

export default TopViews;

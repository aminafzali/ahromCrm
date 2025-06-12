import DIcon from "@/@Client/Components/common/DIcon";

interface StatsCardProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: number | string;
}

const StatsCard = ({ icon, iconBgColor, iconColor, title, value }: StatsCardProps) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className={`p-3 ${iconBgColor} rounded-full`}>
          <DIcon
            icon={icon}
            cdi={false}
            classCustom={`text-2xl ${iconColor}`}
          />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
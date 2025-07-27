import DIcon from "@/@Client/Components/common/DIcon";
import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
import { useEffect, useState } from "react";

interface ServiceSelectionProps {
  onSelect: (serviceId: number) => void;
  selectedService?: number;
}

export default function ServiceSelection({
  selectedService,
  onSelect,
}: ServiceSelectionProps) {
  const { getAll, loading, error } = useServiceType();
  const [services, setServices] = useState<any>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getAll();
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        خطا در دریافت لیست خدمات
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl">
      {services.map((service: any) => (
        <button
          key={service.id}
          className={`rounded-lg flex justify-between items-center cursor-pointer transition-all bg-white border-2 p-3 py-6 ${
            selectedService === service.id
              ? " rounded-lg border-primary shadow-lg"
              : ""
          }`}
          onClick={() => onSelect(service.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DIcon icon="fa-wrench" />
              <h3 className="text-md font-bold ml-2">{service.name}</h3>
            </div>
            {selectedService === service.id && (
              <DIcon
                icon="fa-check-circle"
                classCustom="text-2xl text-primary"
              />
            )}
          </div>
          <div className="text-primary font-bold">
            {service.basePrice.toLocaleString()} تومان
          </div>
        </button>
      ))}
    </div>
  );
}

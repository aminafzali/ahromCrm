import DIcon from "@/@Client/Components/common/DIcon";
import { ServiceType } from "@prisma/client";

interface ServiceSelectionProps {
  onSelect: (serviceId: number) => void;
  selectedService?: number;
  serviceTypes: ServiceType[];
}

export default function ServiceSelection({
  selectedService,
  serviceTypes,
  onSelect,
}: ServiceSelectionProps) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl">
      {serviceTypes.map((service: any) => (
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

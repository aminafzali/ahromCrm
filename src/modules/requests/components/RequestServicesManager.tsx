"use client";

import React, { useEffect, useState } from "react";
import {
  Control,
  FormState,
  useFieldArray,
  UseFormRegister,
  useWatch,
} from "react-hook-form";
import { z } from "zod";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useActualService } from "@/modules/actual-services/hooks/useActualService";
import { ActualService } from "@/modules/actual-services/types";
import { createRequestSchema } from "../validation/schema";

type RequestFormData = z.infer<typeof createRequestSchema>;

interface Props {
  control: Control<RequestFormData>;
  register: UseFormRegister<RequestFormData>;
  formState: FormState<RequestFormData>;
}

// کامپوننت داخلی برای نمایش هر کارت خدمت
const ServiceCard = ({
  service,
  onSelect,
  isSelected,
}: {
  service: ActualService;
  onSelect: () => void;
  isSelected: boolean;
}) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={isSelected}
    className={`bg-white rounded-lg p-3 text-start border-2 w-full transition-all ${
      isSelected
        ? "border-gray-300 opacity-50 cursor-not-allowed"
        : "border-gray-300 border-1 hover:shadow-lg hover:border-primary"
    }`}
  >
    <div className="flex justify-between items-center">
      <h4 className="font-semibold text-md text-gray-800">{service.name}</h4>
      {isSelected && (
        <DIcon icon="fa-check-circle" classCustom="text-primary" />
      )}
    </div>
    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
    <p className="text-md font-bold text-primary mt-2">
      {service.price.toLocaleString()} تومان
    </p>
  </button>
);

const RequestServicesManager: React.FC<Props> = ({
  control,
  register,
  formState,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "actualServices",
  });

  const currentServices = useWatch({ control, name: "actualServices" }) || [];
  const { getAll, loading: isLoading } = useActualService();
  const [availableServices, setAvailableServices] = useState<ActualService[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const params: any = { page: 1, limit: 100 };
        if (searchTerm) {
          params.search = searchTerm;
        }
        const response = await getAll(params);
        if (response.data) {
          setAvailableServices(response.data);
        }
      } catch (error) {
        console.error("خطا در دریافت لیست خدمات:", error);
      }
    };
    fetchServices();
  }, [searchTerm]);

  const handleSelectService = (service: ActualService) => {
    append({
      actualServiceId: service.id,
      quantity: 1,
      price: service.price,
    });
  };

  // ++ اصلاح شد: تابع فقط در availableServices جستجو می‌کند ++
  const getServiceName = (id: number): string => {
    // تنها منبع صحیح برای نام خدمت، لیستی است که از API دریافت شده.
    return availableServices.find((s) => s.id === id)?.name || "...";
  };

  const errors = formState.errors.actualServices;

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="card-title px-4 mb-0">افزودن خدمات به درخواست</h5>
      </div>
      <div className="card-body">
        {/* بخش لیست خدمات انتخاب شده */}
        {fields.length > 0 && (
          <div className="mb-4 p-3 border rounded-lg">
            <h6 className="font-semibold mb-3">خدمات انتخاب شده:</h6>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-wrap items-center gap-3 p-2 bg-gray-50 rounded-md"
                >
                  <button
                    type="button"
                    className=" btn btn-sm btn-outline-danger"
                    onClick={() => remove(index)}
                  >
                    <DIcon icon="fa-times" cdi={false} />
                  </button>
                  
                  <div className="flex-grow font-semibold">
                    {getServiceName(field.actualServiceId)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-sm">تعداد:</label>
                    <input
                      type="number"
                      className={`form-control form-control-sm w-20 ${
                        errors?.[index]?.quantity ? "is-invalid" : ""
                      }`}
                      {...register(`actualServices.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-sm">قیمت واحد:</label>
                    <input
                      type="number"
                      className={`form-control form-control-sm w-32 ${
                        errors?.[index]?.price ? "is-invalid" : ""
                      }`}
                      {...register(`actualServices.${index}.price`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* بخش جستجو و لیست کارت‌های خدمات */}
        <div>
          <input
            type="text"
            className="form-control mb-4 p-2 border rounded-lg"
            placeholder="جستجوی نام خدمت..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {isLoading ? (
            <Loading />
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {availableServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={() => handleSelectService(service)}
                  isSelected={currentServices.some(
                    (s) => s.actualServiceId === service.id
                  )}
                />
              ))}
            </div>
          )}
          {availableServices.length === 0 && !isLoading && (
            <div className="text-center text-muted py-5">
              هیچ خدمتی یافت نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestServicesManager;

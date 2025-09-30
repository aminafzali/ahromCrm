"use client";

import Loading from "@/@Client/Components/common/Loading";
import { useBrand } from "@/modules/brands/hooks/useBrand";
import { BrandWithRelations } from "@/modules/brands/types";
import { useDeviceType } from "@/modules/device-types/hooks/useDeviceType";
import { DeviceTypeWithRelations } from "@/modules/device-types/types";
import { useStatus } from "@/modules/statuses/hooks/useStatus";
import { Status } from "@/modules/statuses/types";
import { useEffect, useState } from "react";

interface ReceivedDeviceFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

export function ReceivedDeviceFilters({
  onFilterChange,
  initialFilters = {},
}: ReceivedDeviceFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);

  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeWithRelations[]>([]);
  const [brands, setBrands] = useState<BrandWithRelations[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const { getAll: getAllDeviceTypes, loading: loadingDeviceTypes } = useDeviceType();
  const { getAll: getAllBrands, loading: loadingBrands } = useBrand();
  const { getAll: getAllStatuses, loading: loadingStatuses } = useStatus();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deviceTypesResponse, brandsResponse, statusesResponse] = await Promise.all([
          getAllDeviceTypes(),
          getAllBrands(),
          getAllStatuses(),
        ]);
        setDeviceTypes(deviceTypesResponse?.data || []);
        setBrands(brandsResponse?.data || []);
        setStatuses(statusesResponse?.data || []);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    const currentFilters = { ...filters };

    if (value === "") {
      delete currentFilters[name];
    } else {
      currentFilters[name] = parseInt(value, 10);
    }
    
    setFilters(currentFilters);
    onFilterChange(currentFilters);
  };

  if (loadingDeviceTypes || loadingBrands || loadingStatuses) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
        <Loading />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="text-lg font-semibold text-gray-700">فیلترها:</label>

        <div className="flex flex-col">
          <label htmlFor="deviceTypeId" className="mb-1 text-sm font-medium text-gray-600">نوع دستگاه</label>
          <select
            id="deviceTypeId"
            name="deviceTypeId"
            value={filters.deviceTypeId || ""}
            onChange={handleChange}
            className="form-select block w-full px-3 py-2 text-base text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded-md transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-primary-600 focus:outline-none"
          >
            <option value="">همه</option>
            {deviceTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="brandId" className="mb-1 text-sm font-medium text-gray-600">برند</label>
          <select
            id="brandId"
            name="brandId"
            value={filters.brandId || ""}
            onChange={handleChange}
            className="form-select block w-full px-3 py-2 text-base text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded-md transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-primary-600 focus:outline-none"
          >
            <option value="">همه</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="statusId" className="mb-1 text-sm font-medium text-gray-600">وضعیت درخواست</label>
          <select
            id="statusId"
            name="statusId" // نام را statusId نگه می‌داریم و در بک‌اند آن را مدیریت می‌کنیم
            value={filters.statusId || ""}
            onChange={handleChange}
            className="form-select block w-full px-3 py-2 text-base text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded-md transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-primary-600 focus:outline-none"
          >
            <option value="">همه</option>
            {statuses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
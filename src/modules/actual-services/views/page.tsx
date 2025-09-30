"use client";
import Loading from "@/@Client/Components/common/Loading";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { FilterOption } from "@/@Client/types";
import { columnsForAdmin } from "@/modules/actual-services/data/table";
import { ActualServiceRepository } from "@/modules/actual-services/repo/ActualServiceRepository";
import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
import { ServiceType } from "@prisma/client";
import { useEffect, useState } from "react";

export default function ActualServicesPage() {
  const { getAll, loading } = useServiceType();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  useEffect(() => {
    get();
  }, []);

  const get = async () => {
    try {
      const data = await getAll();
      setServiceTypes(data?.data || []);
    } catch (error) {
      console.error("Error fetching service types:", error);
    }
  };

  if (loading) return <Loading />;

  const filters: FilterOption[] = [];

  if (serviceTypes.length > 0) {
    const options = [
      {
        value: "all",
        label: "همه",
      },
    ];
    serviceTypes.map((item) =>
      options.push({
        value: String(item.id),
        label: item.name,
      })
    );
    filters.push({
      name: "serviceTypeId",
      label: "نوع خدمت",
      options: options,
    });
  }

  return (
    <IndexWrapper
      title="خدمات"
      columns={columnsForAdmin}
      filterOptions={filters.length > 0 ? filters : undefined}
      repo={new ActualServiceRepository()}
    />
  );
}

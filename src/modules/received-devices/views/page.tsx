"use client";

import Loading from "@/@Client/Components/common/Loading";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { FilterOption } from "@/@Client/types";
import { useBrand } from "@/modules/brands/hooks/useBrand";
import { BrandWithRelations } from "@/modules/brands/types";
import { useDeviceType } from "@/modules/device-types/hooks/useDeviceType";
import { DeviceTypeWithRelations } from "@/modules/device-types/types";
import { useStatus } from "@/modules/statuses/hooks/useStatus";
import { Status } from "@/modules/statuses/types";
import { useEffect, useState } from "react";
import { columnsForAdmin, listItemRender } from "../data/table";
import { ReceivedDeviceRepository } from "../repo/ReceivedDeviceRepository";

export default function IndexPage({ title = "دستگاه‌های دریافتی" }) {
  const { getAll: getAllDeviceTypes, loading: loadingDeviceTypes } =
    useDeviceType();
  const { getAll: getAllBrands, loading: loadingBrands } = useBrand();
  const { getAll: getAllStatuses, loading: loadingStatuses } = useStatus();

  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeWithRelations[]>([]);
  const [brands, setBrands] = useState<BrandWithRelations[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    const get = async () => {
      try {
        const [deviceTypesRes, brandsRes, statusesRes] = await Promise.all([
          getAllDeviceTypes(),
          getAllBrands(),
          getAllStatuses(),
        ]);
        setDeviceTypes(deviceTypesRes?.data || []);
        setBrands(brandsRes?.data || []);
        setStatuses(statusesRes?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    get();
  }, []);

  if (loadingDeviceTypes || loadingBrands || loadingStatuses) {
    return <Loading />;
  }

  const filters: FilterOption[] = [];

  if (deviceTypes.length > 0) {
    filters.push({
      name: "deviceTypeId",
      label: "نوع دستگاه",
      options: [
        { value: "all", label: "همه" },
        ...deviceTypes.map((item) => ({
          value: String(item.id),
          label: item.name,
        })),
      ],
    });
  }

  if (brands.length > 0) {
    filters.push({
      name: "brandId",
      label: "برند",
      options: [
        { value: "all", label: "همه" },
        ...brands.map((item) => ({ value: String(item.id), label: item.name })),
      ],
    });
  }
  // +++ افزودن فیلتر جدید برای وضعیت تحویل +++
  const deliveredFilter: FilterOption = {
    name: "isDelivered_bool",
    label: "وضعیت تحویل دستگاه",
    options: [
      { value: "all", label: "همه" },
      { value: "true", label: "تحویل داده شده" },
      { value: "false", label: "تحویل نشده" },
    ],
  };
  filters.push(deliveredFilter);
  // +++ پایان افزودن فیلتر +++

  // هشدار: این فیلتر تا زمانی که منطق تو در توی آن در بک‌اند پیاده‌سازی نشود، کار نخواهد کرد
  if (statuses.length > 0) {
    filters.push({
      name: "statusId",
      label: "وضعیت درخواست",
      options: [
        // { value: "null", label: "بدون درخواست متصل" },
        { value: "all", label: "همه" },
        ...statuses.map((item) => ({
          value: String(item.id),
          label: item.name,
        })),
      ],
    });
  }

  return (
    <IndexWrapper
      title={title}
      columns={columnsForAdmin}
      listItemRender={listItemRender}
      filterOptions={filters.length > 0 ? filters : undefined}
      repo={new ReceivedDeviceRepository()}
      createUrl={true}
      listClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    />
  );
}

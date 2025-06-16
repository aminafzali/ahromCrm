// src/modules/received-devices/views/page.tsx

"use client";

import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import { useState } from "react";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useReceivedDevice } from "../hooks/useReceivedDevice";
import { ReceivedDeviceWithRelations } from "../types";
import ReceivedDeviceFilters from "../components/ReceivedDeviceFilters";

export default function IndexPage({ title = "دستگاه‌های دریافتی" }) {
  const { getAll, loading, error } = useReceivedDevice();
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters: any) => {
    // فقط فیلترهای دارای مقدار را نگه می‌داریم
    const activeFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v != null && v !== '')
    );
    setFilters(activeFilters);
  };

  // تابع fetcher اکنون فیلترها را نیز ارسال می‌کند
  const fetcher = (params: any) => getAll({ ...params, ...filters });

  return (
    <div>
      {/* کامپوننت فیلتر در اینجا اضافه شده است */}
      <ReceivedDeviceFilters onFilterChange={handleFilterChange} />

      <DataTableWrapper<ReceivedDeviceWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/received-devices/create"
        loading={loading}
        error={error}
        title={title}
        fetcher={fetcher}
        // تابع رندر نمای کارتی به Wrapper پاس داده می‌شود
        listItemRender={listItemRender}
        listClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      />
    </div>
  );
}
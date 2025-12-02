"use client";

import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import { columns } from "../data/table";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import { PurchaseOrderWithRelations } from "../types";

export default function PurchaseOrdersView() {
  const { getAll, loading, error } = usePurchaseOrder();

  return (
    <DataTableWrapper<PurchaseOrderWithRelations>
      columns={columns}
      createUrl="/dashboard/purchase-orders/create"
      loading={loading}
      error={error}
      title="سفارشات خرید"
      fetcher={getAll}
      defaultViewMode="table"
    />
  );
}

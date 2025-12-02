"use client";

import Loading from "@/@Client/Components/common/Loading";
import { Suspense, lazy } from "react";

const PurchaseOrdersView = lazy(
  () => import("@/modules/purchase-orders/views/page")
);

export default function PurchaseOrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PurchaseOrdersView />
    </Suspense>
  );
}

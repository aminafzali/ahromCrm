"use client";

import Loading from "@/@Client/Components/common/Loading";
import { Suspense, lazy } from "react";

const CreatePurchaseOrderView = lazy(
  () => import("@/modules/purchase-orders/views/create/page")
);

export default function CreatePurchaseOrderPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CreatePurchaseOrderView />
    </Suspense>
  );
}


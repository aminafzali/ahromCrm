"use client";

import Loading from "@/@Client/Components/common/Loading";
import { Suspense, lazy } from "react";

const OrdersView = lazy(() => import("@/modules/orders/views/page"));

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersView />
    </Suspense>
  );
}

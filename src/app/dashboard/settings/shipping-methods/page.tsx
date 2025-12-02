"use client";

import Loading from "@/@Client/Components/common/Loading";
import { Suspense, lazy } from "react";

const ShippingMethodsView = lazy(
  () => import("@/modules/shipping/views/page")
);

export default function ShippingMethodsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ShippingMethodsView />
    </Suspense>
  );
}


"use client";

import Loading from "@/@Client/Components/common/Loading";
import { Suspense, lazy } from "react";

const PaymentGatewaysView = lazy(
  () => import("@/modules/payment-gateway/views/page")
);

export default function PaymentGatewaysPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentGatewaysView />
    </Suspense>
  );
}


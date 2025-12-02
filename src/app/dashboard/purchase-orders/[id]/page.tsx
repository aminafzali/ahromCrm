"use client";

import { useParams } from "next/navigation";
import PurchaseOrderDetailView from "@/modules/purchase-orders/views/view/page";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : 0;

  return <PurchaseOrderDetailView id={id} />;
}


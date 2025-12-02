import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DynamicUpdateWrapper from "@/@Client/Components/wrappers/DynamicUpdateWrapper";
import { useProduct } from "@/modules/products/hooks/useProduct";
import { ProductWithRelations } from "@/modules/products/types";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getPurchaseOrderFormConfig } from "../../../data/form";
import { usePurchaseOrder } from "../../../hooks/usePurchaseOrder";
import { createPurchaseOrderSchema } from "../../../validation/schema";

interface UpdatePurchaseOrderPageProps {
  id: number;
}

export default function UpdatePurchaseOrderPage({
  id,
}: UpdatePurchaseOrderPageProps) {
  const router = useRouter();
  const {
    getById,
    update,
    submitting: loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = usePurchaseOrder();

  const { getAll: getAllProducts, loading: loadingProducts } = useProduct();
  const { getAll: getAllWorkspaceUsers, loading: loadingWorkspaceUsers } =
    useWorkspaceUser();

  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [suppliers, setSuppliers] = useState<WorkspaceUserWithRelations[]>([]);
  const [purchaseOrderData, setPurchaseOrderData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [mainData, productsData, suppliersData] = await Promise.all([
        getById(id),
        getAllProducts({ page: 1, limit: 100 }),
        getAllWorkspaceUsers({ page: 1, limit: 100 }),
      ]);

      setPurchaseOrderData(mainData);
      setProducts(productsData.data);
      setSuppliers(suppliersData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (
    data: z.infer<typeof createPurchaseOrderSchema>
  ) => {
    try {
      await update(id, data);
      router.push("/dashboard/purchase-orders");
    } catch (error) {
      console.error("Error updating purchase order:", error);
    }
  };

  if (dataLoading || loadingProducts || loadingWorkspaceUsers)
    return <Loading />;
  if (statusCode === 404) return <NotFound />;

  const data = new Map<string, any>();
  data.set("products", products);
  data.set("suppliers", suppliers);

  return (
    <div className="space-y-6">
      <DynamicUpdateWrapper
        title="ویرایش سفارش خرید"
        backUrl="/dashboard/purchase-orders"
        formConfig={getPurchaseOrderFormConfig(data)}
        defaultValues={purchaseOrderData}
        onSubmit={handleSubmit}
        entityId={id}
        isLoading={loading}
        error={error}
        success={success}
      />
    </div>
  );
}

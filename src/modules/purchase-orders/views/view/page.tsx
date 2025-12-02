"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { Button } from "ndui-ahrom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PurchaseOrderStatusBadge } from "../../components";
import { usePurchaseOrder } from "../../hooks/usePurchaseOrder";
import { PurchaseOrderWithRelations } from "../../types";

interface PurchaseOrderDetailPageProps {
  id: number;
}

export default function PurchaseOrderDetailPage({
  id,
}: PurchaseOrderDetailPageProps) {
  const router = useRouter();
  const {
    getById,
    loading,
    statusCode,
    approve,
    receive,
    cancel,
    convertToInvoice,
  } = usePurchaseOrder();

  const [purchaseOrder, setPurchaseOrder] =
    useState<PurchaseOrderWithRelations | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPurchaseOrder();
    }
  }, [id]);

  const fetchPurchaseOrder = async () => {
    try {
      const data = await getById(id);
      if (data) setPurchaseOrder(data);
    } catch (error) {
      console.error("Error fetching purchase order:", error);
    }
  };

  const handleApprove = async () => {
    if (!confirm("آیا از تایید این سفارش خرید اطمینان دارید؟")) return;

    setActionLoading(true);
    try {
      await approve(id);
      alert("سفارش خرید تایید شد");
      fetchPurchaseOrder();
    } catch (error) {
      alert("خطا در تایید سفارش خرید");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceive = async () => {
    if (!confirm("آیا از دریافت کالای این سفارش اطمینان دارید؟")) return;

    setActionLoading(true);
    try {
      await receive(id);
      alert("دریافت کالا تایید و موجودی به‌روزرسانی شد");
      fetchPurchaseOrder();
    } catch (error) {
      alert("خطا در تایید دریافت کالا");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!confirm("آیا می‌خواهید این سفارش را به فاکتور تبدیل کنید؟")) return;

    setActionLoading(true);
    try {
      const invoice = await convertToInvoice(id);
      alert(`فاکتور با شماره ${invoice.id} ایجاد شد`);
      fetchPurchaseOrder();
    } catch (error) {
      alert("خطا در تبدیل به فاکتور");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("آیا از لغو این سفارش خرید اطمینان دارید؟")) return;

    setActionLoading(true);
    try {
      await cancel(id);
      alert("سفارش خرید لغو شد");
      fetchPurchaseOrder();
    } catch (error) {
      alert("خطا در لغو سفارش خرید");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;
  if (!purchaseOrder) return <NotFound />;

  const totalAmount = purchaseOrder.items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">سفارش خرید #{purchaseOrder.id}</h1>
          <p className="text-gray-500 mt-1">
            {new Date(purchaseOrder.createdAt).toLocaleDateString("fa-IR")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/purchase-orders/${id}/update`}>
            <Button variant="secondary" disabled={actionLoading}>
              ویرایش
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/purchase-orders")}
          >
            بازگشت
          </Button>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">وضعیت</h3>
            <PurchaseOrderStatusBadge status={purchaseOrder.status} />
          </div>

          <div className="flex gap-2">
            {purchaseOrder.status === "PENDING" && (
              <>
                <Button onClick={handleApprove} disabled={actionLoading}>
                  تایید سفارش
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  لغو
                </Button>
              </>
            )}

            {purchaseOrder.status === "APPROVED" &&
              !purchaseOrder.linkedInvoiceId && (
                <>
                  <Button onClick={handleReceive} disabled={actionLoading}>
                    دریافت کالا
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleConvertToInvoice}
                    disabled={actionLoading}
                  >
                    تبدیل به فاکتور
                  </Button>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Supplier Info */}
      {purchaseOrder.supplierWorkspaceUser && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">تامین‌کننده</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">نام</p>
              <p className="font-medium">
                {purchaseOrder.supplierWorkspaceUser.user?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">تلفن</p>
              <p className="font-medium">
                {purchaseOrder.supplierWorkspaceUser.user?.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">آیتم‌های سفارش</h3>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium">
                محصول
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                تعداد
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                قیمت واحد
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">جمع</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {purchaseOrder.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.product?.name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">
                  {item.unitPrice.toLocaleString("fa-IR")} تومان
                </td>
                <td className="px-4 py-3 font-medium">
                  {item.total.toLocaleString("fa-IR")} تومان
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                جمع کل
              </td>
              <td className="px-4 py-3 font-bold text-lg">
                {totalAmount.toLocaleString("fa-IR")} تومان
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      {purchaseOrder.notes && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-2">یادداشت</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {purchaseOrder.notes}
          </p>
        </div>
      )}

      {/* Linked Invoice */}
      {purchaseOrder.linkedInvoiceId && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold mb-2">فاکتور مرتبط</h3>
          <Link
            href={`/dashboard/invoices/${purchaseOrder.linkedInvoiceId}`}
            className="text-blue-600 hover:underline font-medium"
          >
            مشاهده فاکتور #{purchaseOrder.linkedInvoice?.invoiceNumberName}
          </Link>
        </div>
      )}
    </div>
  );
}

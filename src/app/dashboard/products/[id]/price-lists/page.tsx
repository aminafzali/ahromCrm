"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import PriceListForm from "@/modules/product-price-lists/components/PriceListForm";
import { Button } from "ndui-ahrom";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductPriceListsPage() {
  const params = useParams();
  const productId = params?.id ? Number(params.id) : 0;

  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState<any>(null);

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  const loadData = async () => {
    try {
      const [priceListsRes, userGroupsRes] = await Promise.all([
        fetch(`/api/product-price-lists?productId=${productId}`),
        fetch("/api/user-groups?page=1&limit=100"),
      ]);

      if (priceListsRes.ok) {
        const data = await priceListsRes.json();
        setPriceLists(data.data || []);
      }

      if (userGroupsRes.ok) {
        const data = await userGroupsRes.json();
        setUserGroups(data.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = editingPriceList
        ? `/api/product-price-lists/${editingPriceList.id}`
        : "/api/product-price-lists";
      const method = editingPriceList ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("قیمت با موفقیت ذخیره شد");
        setShowForm(false);
        setEditingPriceList(null);
        loadData();
      } else {
        alert("خطا در ذخیره قیمت");
      }
    } catch (error) {
      console.error("Error saving price list:", error);
      alert("خطا در ذخیره قیمت");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این قیمت اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/product-price-lists/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("قیمت با موفقیت حذف شد");
        loadData();
      } else {
        alert("خطا در حذف قیمت");
      }
    } catch (error) {
      console.error("Error deleting price list:", error);
      alert("خطا در حذف قیمت");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لیست قیمت محصول</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
            افزودن قیمت جدید
          </Button>
        )}
      </div>

      {showForm ? (
        <PriceListForm
          productId={productId}
          userGroups={userGroups}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPriceList(null);
          }}
          initialData={editingPriceList}
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  گروه کاربری
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  قیمت اصلی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  قیمت با تخفیف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  درصد تخفیف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {priceLists.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500">
                      هیچ قیمتی برای این محصول تعریف نشده است
                    </p>
                  </td>
                </tr>
              ) : (
                priceLists.map((priceList) => (
                  <tr key={priceList.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">
                        {priceList.userGroup?.name || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">
                        {priceList.price.toLocaleString("fa-IR")} تومان
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p>
                        {priceList.discountPrice
                          ? `${priceList.discountPrice.toLocaleString(
                              "fa-IR"
                            )} تومان`
                          : "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p>
                        {priceList.discountPercent
                          ? `${priceList.discountPercent}%`
                          : "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          priceList.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {priceList.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingPriceList(priceList);
                            setShowForm(true);
                          }}
                        >
                          <DIcon icon="fa-edit" cdi={false} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(priceList.id)}
                        >
                          <DIcon icon="fa-trash" cdi={false} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


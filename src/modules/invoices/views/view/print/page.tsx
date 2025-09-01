"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Button } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { useInvoice } from "../../../hooks/useInvoice";
import { InvoiceWithRelations } from "../../../types";

interface PrintInvoicePageProps {
  id: number;
}

export default function PrintInvoicePage({ id }: PrintInvoicePageProps) {
  const { getById, loading: dataLoading, statusCode } = useInvoice();
  const [invoice, setInvoice] = useState<InvoiceWithRelations>(
    {} as InvoiceWithRelations
  );

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      const data = await getById(id);
      if (data != undefined) setInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };
  const handlePrint = () => {
    const content = document.getElementById("print-section");
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=1024,height=768");
    if (!printWindow) return;

    const htmlContent = `
    <html>
      <head>
        <title>چاپ فاکتور</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            font-family: Tahoma, sans-serif;
            direction: rtl;
            padding: 20mm;
            margin: 0;
            background: white;
            color: black;
            font-size: 12pt;
          }
          h1, h2, h3, p {
            margin: 0 0 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 12pt;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
          }
          .signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature div {
            width: 40%;
            border-top: 1px solid #000;
            text-align: center;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.focus();
    printWindow.print();
    // اختیاری: بستن پنجره بعد چاپ
    printWindow.close();
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="print:hidden mb-4">
        <Button
          onClick={handlePrint}
          icon={<DIcon icon="fa-print" cdi={false} classCustom="ml-2" />}
        >
          چاپ فاکتور
        </Button>
      </div>
      <div id="print-section">
        <div className="bg-white p-8 shadow-lg print:shadow-none">
          {/* Header */}
          <div className="mb-4 border-b pb-4">
            <h1 className="text-2xl font-bolditems-start ">فاکتور فروش</h1>
            <div className=" flex justify-between ">
              <p className="text-gray-600">شماره فاکتور: {invoice.id}</p>
              <p className="text-gray-600">
                تاریخ: <DateDisplay date={invoice.createdAt} short={false} />
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold mb-2">اطلاعات مشتری</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>نام:</strong>{" "}
                  {invoice.workspaceUser?.displayName ||
                    invoice.workspaceUser?.user.name ||
                    "نامشخص"}
                </p>
                <p>
                  <strong>تلفن:</strong> {invoice.workspaceUser?.user.phone}
                </p>
              </div>
              <div>
                <p>
                  <strong>آدرس:</strong>{" "}
                  {invoice.workspaceUser?.user.address || "-"}
                </p>
                <p>
                  <strong>نوع خدمات:</strong>{" "}
                  {invoice.request?.serviceType.name || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-right py-2">شرح</th>
                  <th className="text-center py-2">تعداد</th>
                  <th className="text-center py-2">قیمت واحد (تومان)</th>
                  <th className="text-left py-2">جمع (تومان)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-center py-2">
                      {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="text-left py-2">
                      {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>جمع کل:</span>
                <span>{invoice.subtotal?.toLocaleString()} تومان</span>
              </div>
              <div className="flex justify-between py-2">
                <span>مالیات:</span>
                <span>{invoice.tax?.toLocaleString()} تومان</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between py-2">
                  <span>تخفیف:</span>
                  <span>{invoice.discount?.toLocaleString()} تومان</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t font-bold">
                <span>مبلغ قابل پرداخت:</span>
                <span>{invoice.total?.toLocaleString()} تومان</span>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-8 pt-8 border-t">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">مهر و امضای فروشنده</p>
                <div className="mt-8 border-b border-gray-400 w-48"></div>
              </div>
              <div>
                <p className="font-semibold">امضای خریدار</p>
                <div className="mt-8 border-b border-gray-400 w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

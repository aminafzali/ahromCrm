import { TabsWrapper } from "@/@Client/Components/wrappers";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { FilterOption } from "@/@Client/types";
import { columnsForAdmin, listItemRender } from "../data/table";
import { PaymentRepository } from "../repo/PaymentRepository";

export default function IndexPage({ isAdmin = true, title = "پرداخت‌ها" }) {
  const filters: FilterOption[] = [
    {
      name: "status",
      label: "وضعیت",
      options: [
        { value: "all", label: "همه" },
        { value: "PENDING", label: "در انتظار" },
        { value: "SUCCESS", label: "موفق" },
        { value: "FAILED", label: "ناموفق" },
      ],
    },
    {
      name: "method",
      label: "روش پرداخت",
      options: [
        { value: "all", label: "همه" },
        { value: "CASH", label: "نقدی" },
        { value: "CARD", label: "کارت" },
        { value: "TRANSFER", label: "انتقال" },
      ],
    },
  ];

  return (
    <TabsWrapper
      tabs={[
        {
          id: "received",
          label: "دریافتی ها",
          content: (
            <IndexWrapper
              key="received" // اضافه کردن کلید یکتا
              columns={columnsForAdmin}
              listItemRender={listItemRender}
              filterOptions={filters}
              repo={new PaymentRepository()}
              createUrl={true}
              title="دریافتی ها"
              defaultViewMode="table"
              defaultFilter={[{ type: "RECEIVE" }]}
            />
          ),
        },
        {
          id: "payment",
          label: "پرداختی ها",
          content: (
            <IndexWrapper
              key="payment" // اضافه کردن کلید یکتا
              columns={columnsForAdmin}
              listItemRender={listItemRender}
              filterOptions={filters}
              repo={new PaymentRepository()}
              createUrl={true}
              title="پرداختی ها"
              defaultViewMode="table"
              defaultFilter={[{ type: "PAY" }]}
            />
          ),
        },
      ]}
    />
  );
}

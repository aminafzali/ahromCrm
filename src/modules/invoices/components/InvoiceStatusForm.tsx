import { z } from "zod";
import { useInvoice } from "../hooks/useInvoice";
import { updateInvoiceStatusSchema } from "../validation/schema";

interface InvoiceStatusFormProps {
  invoiceId: number;
  currentStatus: string;
  currentPaymentDate?: Date | null;
  onSuccess: () => void;
}

const schema = z.object({
  status: z.string().min(1, "وضعیت الزامی است"),
  paymentDate: z.string().optional(),
});

export default function InvoiceStatusForm({
  invoiceId,
  currentStatus,
  currentPaymentDate,
  onSuccess,
}: InvoiceStatusFormProps) {
  const { updateStatus, loading, error, success } = useInvoice();

  const handleSubmit = async (
    data: z.infer<typeof updateInvoiceStatusSchema>
  ) => {
    try {
      await updateStatus(invoiceId, data);
      onSuccess();
    } catch (error) {
      console.error("Error updating invoice status:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">بروزرسانی وضعیت پرداخت</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* <Form
        schema={schema}
        onSubmit={handleSubmit}
        defaultValues={{
          status: currentStatus,
          paymentDate: FormHelper.formatDateForInput(currentPaymentDate),
        }}
      >
        <div className="space-y-4">
          <Select
            name="status"
            label="وضعیت پرداخت"
            options={invoiceStatusOptions}
          />

          <Input
            name="paymentDate"
            label="تاریخ پرداخت"
            type="date"
            placeholder="تاریخ پرداخت را انتخاب کنید"
          />

          <Button
            type="submit"
            disabled={loading}
            icon={<DIcon icon="fa-save" cdi={false} classCustom="ml-2" />}
          >
            {loading ? "در حال بروزرسانی..." : "بروزرسانی وضعیت"}
          </Button>
        </div>
      </Form> */}
    </div>
  );
}

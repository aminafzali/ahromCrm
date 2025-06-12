import DIcon from "@/@Client/Components/common/DIcon";
import { useStatus } from "@/modules/statuses/hooks/useStatus";
import { Button, Checkbox, Form, Input, Select } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useRequest } from "../hooks/useRequest";
import { updateRequestStatusSchema } from "../validation/schema";

interface RequestStatusFormProps {
  requestId: number;
  currentStatus: number;
  onSuccess: () => void;
}

export default function RequestStatusForm({
  requestId,
  currentStatus,
  onSuccess,
}: RequestStatusFormProps) {
  const { updateStatus, submitting: loading, error, success } = useRequest();
  const { getAll: getStatuses } = useStatus();
  const [statusOptions, setStatusOptions] = useState<
    { value: number; label: string }[]
  >([]);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const response = await getStatuses();
      setStatusOptions(
        response.data.map((status: { id: number; name: string }) => ({
          value: status.id,
          label: status.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const handleSubmit = async (
    data: z.infer<typeof updateRequestStatusSchema>
  ) => {
    try {
      await updateStatus(requestId, {
        statusId: data.statusId,
        note: data.note || "",
        sendSms: data.sendSms,
      });
      onSuccess();
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  return (
    <div className="p-1">
      <h2 className="text-xl font-semibold mb-4">بروزرسانی وضعیت درخواست</h2>

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

      <Form
        schema={updateRequestStatusSchema}
        onSubmit={handleSubmit}
        defaultValues={{
          sendSms: true,
          statusId: currentStatus,
          note: "",
        }}
      >
        <div className="space-y-4">
          <Select
            name="statusId"
            label="وضعیت درخواست"
            options={statusOptions}
          />

          <Input
            name="note"
            label="یادداشت"
            placeholder="توضیحات تغییر وضعیت را وارد کنید(به کاربر ارسال خواهد شد)"
          />

          <Checkbox
            name="sendSms"
            label="پیامک ارسال شود"
            placeholder="توضیحات تغییر وضعیت را وارد کنید(به کاربر ارسال خواهد شد)"
          />

          <Button
            type="submit"
            disabled={loading}
            icon={<DIcon icon="fa-save" cdi={false} classCustom="ml-2" />}
          >
            {loading ? "در حال بروزرسانی..." : "بروزرسانی وضعیت"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Input2 from "@/@Client/Components/ui/Input2";
import Select3 from "@/@Client/Components/ui/Select3";
import { SupportPriority } from "@prisma/client";
import { Button } from "ndui-ahrom";
import { useState } from "react";
import { useSupportChat } from "../hooks/useSupportChat";
import { SupportTicketWithRelations } from "../types";

interface NewTicketFormProps {
  onSubmit: (ticket: SupportTicketWithRelations) => void;
  onCancel: () => void;
}

export default function NewTicketForm({
  onSubmit,
  onCancel,
}: NewTicketFormProps) {
  const { repo } = useSupportChat();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM" as SupportPriority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ticket = await repo.createCustomerTicket(formData);
      onSubmit(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("خطا در ایجاد تیکت");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Input2
          name="subject"
          label="عنوان"
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          placeholder="موضوع تیکت خود را وارد کنید"
          required
        />

        <Input2
          name="description"
          label="توضیحات"
          type="textarea"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="شرح کامل مشکل خود را بنویسید"
          required
        />

        <Select3
          name="priority"
          label="اولویت"
          value={formData.priority}
          onChange={(e) =>
            setFormData({
              ...formData,
              priority: e.target.value as SupportPriority,
            })
          }
          options={[
            { value: "LOW", label: "کم" },
            { value: "MEDIUM", label: "متوسط" },
            { value: "HIGH", label: "زیاد" },
            { value: "CRITICAL", label: "بحرانی" },
          ]}
        />
      </div>

      <div className="p-4 border-t dark:border-slate-700 flex gap-2">
        <Button
          type="submit"
          loading={loading}
          disabled={!formData.subject || !formData.description}
          className="flex-1"
          icon={<DIcon icon="fa-paper-plane" cdi={false} classCustom="ml-2" />}
        >
          {loading ? "در حال ارسال..." : "ارسال تیکت"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          className="flex-1"
        >
          انصراف
        </Button>
      </div>
    </form>
  );
}

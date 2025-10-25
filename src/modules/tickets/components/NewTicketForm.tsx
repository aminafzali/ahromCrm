"use client";

import { Button, Input, Select } from "ndui-ahrom";
import { useState } from "react";
import { useTickets } from "../hooks/useTickets";

interface NewTicketFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewTicketForm({
  onClose,
  onSuccess,
}: NewTicketFormProps) {
  const { create, submitting } = useTickets();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM",
    status: "OPEN",
    categoryId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create({
        ...formData,
        priority: formData.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        status: formData.status as "OPEN" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">ایجاد تیکت جدید</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="subject"
          label="موضوع"
          value={formData.subject}
          onChange={handleInputChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            توضیحات
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            required
          />
        </div>

        <Select
          name="priority"
          label="اولویت"
          value={formData.priority}
          onChange={handleInputChange}
          options={[
            { value: "LOW", label: "کم" },
            { value: "MEDIUM", label: "متوسط" },
            { value: "HIGH", label: "زیاد" },
            { value: "URGENT", label: "فوری" },
          ]}
        />

        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting}
          >
            ایجاد تیکت
          </Button>
        </div>
      </form>
    </div>
  );
}

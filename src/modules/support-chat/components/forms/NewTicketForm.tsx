"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Input2 from "@/@Client/Components/ui/Input2";
import Select3 from "@/@Client/Components/ui/Select3";
import { Button } from "ndui-ahrom";
import React, { useCallback, useEffect, useState } from "react";
import { SupportPriority } from "../../types";

// Types
interface NewTicketFormProps {
  onSubmit: (ticket: any) => void;
  onCancel: () => void;
  className?: string;
  loading?: boolean;
}

interface TicketFormData {
  subject: string;
  description: string;
  priority: SupportPriority;
  categoryId?: number;
  attachments?: File[];
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

// Constants
const PRIORITY_OPTIONS = [
  { value: "LOW", label: "کم", color: "text-green-600" },
  { value: "MEDIUM", label: "متوسط", color: "text-blue-600" },
  { value: "HIGH", label: "بالا", color: "text-orange-600" },
  { value: "URGENT", label: "فوری", color: "text-red-600" },
] as const;

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Helper Functions
const validateForm = (
  data: TicketFormData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.subject.trim()) {
    errors.push("عنوان تیکت الزامی است");
  } else if (data.subject.trim().length < 5) {
    errors.push("عنوان تیکت باید حداقل 5 کاراکتر باشد");
  }

  if (!data.description.trim()) {
    errors.push("توضیحات تیکت الزامی است");
  } else if (data.description.trim().length < 10) {
    errors.push("توضیحات تیکت باید حداقل 10 کاراکتر باشد");
  }

  if (data.attachments && data.attachments.length > MAX_ATTACHMENTS) {
    errors.push(`حداکثر ${MAX_ATTACHMENTS} فایل قابل آپلود است`);
  }

  if (data.attachments) {
    for (const file of data.attachments) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`فایل ${file.name} بیش از حد مجاز است (حداکثر 10MB)`);
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`نوع فایل ${file.name} پشتیبانی نمی‌شود`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Sub-components
const FileUpload: React.FC<{
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled: boolean;
}> = ({ files, onFilesChange, disabled }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const newFiles = [...files, ...selectedFiles].slice(0, MAX_ATTACHMENTS);
      onFilesChange(newFiles);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [files, onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      onFilesChange(newFiles);
    },
    [files, onFilesChange]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        فایل‌های ضمیمه (اختیاری)
      </label>

      {/* File Input */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_FILE_TYPES.join(",")}
          onChange={handleFileSelect}
          disabled={disabled || files.length >= MAX_ATTACHMENTS}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || files.length >= MAX_ATTACHMENTS}
          className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <DIcon icon="fa-paperclip" classCustom="ml-2" />
          انتخاب فایل
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          حداکثر {MAX_ATTACHMENTS} فایل، هر فایل حداکثر 10MB
        </span>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <DIcon icon="fa-file" classCustom="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DIcon icon="fa-times" classCustom="text-sm" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FormHeader: React.FC<{
  onCancel: () => void;
}> = ({ onCancel }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
      ایجاد تیکت جدید
    </h2>
    <button
      onClick={onCancel}
      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    >
      <DIcon icon="fa-times" classCustom="text-lg" />
    </button>
  </div>
);

const FormFooter: React.FC<{
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  disabled: boolean;
}> = ({ onSubmit, onCancel, loading, disabled }) => (
  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
    <Button
      type="button"
      onClick={onSubmit}
      loading={loading}
      disabled={disabled || loading}
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
      disabled={loading}
    >
      انصراف
    </Button>
  </div>
);

// Main Component
const NewTicketForm: React.FC<NewTicketFormProps> = ({
  onSubmit,
  onCancel,
  className = "",
  loading = false,
}) => {
  const [formData, setFormData] = useState<TicketFormData>({
    subject: "",
    description: "",
    priority: "MEDIUM",
    categoryId: undefined,
    attachments: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/support-chat/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = useCallback(
    (field: keyof TicketFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear errors when user starts typing
      if (errors.length > 0) {
        setErrors([]);
      }
    },
    [errors.length]
  );

  const handleFilesChange = useCallback(
    (files: File[]) => {
      setFormData((prev) => ({ ...prev, attachments: files }));
      // Clear errors when user adds files
      if (errors.length > 0) {
        setErrors([]);
      }
    },
    [errors.length]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateForm(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      setIsSubmitting(true);
      try {
        // Upload files if any
        const uploadedFiles: any[] = [];
        if (formData.attachments && formData.attachments.length > 0) {
          for (const file of formData.attachments) {
            const formData = new FormData();
            formData.append("file", file);
            // Note: This would need a proper upload endpoint
            // const response = await fetch("/api/support-chat/upload", {
            //   method: "POST",
            //   body: formData,
            // });
            // const result = await response.json();
            // uploadedFiles.push(result);
          }
        }

        // Create ticket
        const ticketData = {
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          categoryId: formData.categoryId,
          attachments: uploadedFiles,
        };

        const response = await fetch("/api/support-chat/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticketData),
        });

        if (!response.ok) {
          throw new Error("Failed to create ticket");
        }

        const ticket = await response.json();
        onSubmit(ticket);
      } catch (error) {
        console.error("Error creating ticket:", error);
        setErrors(["خطا در ایجاد تیکت. لطفاً دوباره تلاش کنید."]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit]
  );

  const isFormValid =
    formData.subject.trim().length >= 5 &&
    formData.description.trim().length >= 10;

  return (
    <form
      onSubmit={handleSubmit}
      className={`h-full flex flex-col ${className}`}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <FormHeader onCancel={onCancel} />

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <DIcon
                icon="fa-exclamation-triangle"
                classCustom="text-red-500 mt-0.5"
              />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  خطاهای زیر را برطرف کنید:
                </h4>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Subject */}
        <Input2
          name="subject"
          label="عنوان تیکت"
          value={formData.subject}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          placeholder="موضوع تیکت خود را وارد کنید"
          required
          disabled={loading || isSubmitting}
          className="w-full"
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            توضیحات <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="شرح کامل مشکل خود را بنویسید"
            required
            disabled={loading || isSubmitting}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.description.length}/1000 کاراکتر
          </p>
        </div>

        {/* Priority */}
        <Select3
          name="priority"
          label="اولویت"
          value={formData.priority}
          onChange={(e) =>
            handleInputChange("priority", e.target.value as SupportPriority)
          }
          options={PRIORITY_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          disabled={loading || isSubmitting}
        />

        {/* Category */}
        {categories.length > 0 && (
          <Select3
            name="categoryId"
            label="دسته‌بندی (اختیاری)"
            value={formData.categoryId?.toString() || ""}
            onChange={(e) =>
              handleInputChange(
                "categoryId",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            options={[
              { value: "", label: "انتخاب دسته‌بندی" },
              ...categories.map((cat) => ({
                value: cat.id.toString(),
                label: cat.name,
              })),
            ]}
            disabled={loading || isSubmitting}
          />
        )}

        {/* File Upload */}
        <FileUpload
          files={formData.attachments || []}
          onFilesChange={handleFilesChange}
          disabled={loading || isSubmitting}
        />
      </div>

      <FormFooter
        onSubmit={() => handleSubmit(new Event("submit") as any)}
        onCancel={onCancel}
        loading={isSubmitting}
        disabled={!isFormValid}
      />
    </form>
  );
};

export default NewTicketForm;
export type { NewTicketFormProps };

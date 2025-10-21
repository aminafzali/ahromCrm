"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Input2 from "@/@Client/Components/ui/Input2";
import Select3 from "@/@Client/Components/ui/Select3";
import { Button } from "ndui-ahrom";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

interface FormErrors {
  subject?: string;
  description?: string;
  priority?: string;
  attachments?: string;
  general?: string;
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

// Validation functions
const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `فایل باید کمتر از ${Math.round(
        MAX_FILE_SIZE / (1024 * 1024)
      )} مگابایت باشد`,
    };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "نوع فایل پشتیبانی نمی‌شود",
    };
  }

  return { isValid: true };
};

const validateForm = (data: TicketFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.subject.trim()) {
    errors.subject = "موضوع تیکت الزامی است";
  } else if (data.subject.trim().length < 3) {
    errors.subject = "موضوع باید حداقل 3 کاراکتر باشد";
  } else if (data.subject.trim().length > 200) {
    errors.subject = "موضوع نمی‌تواند بیش از 200 کاراکتر باشد";
  }

  if (!data.description.trim()) {
    errors.description = "توضیحات تیکت الزامی است";
  } else if (data.description.trim().length < 10) {
    errors.description = "توضیحات باید حداقل 10 کاراکتر باشد";
  } else if (data.description.trim().length > 2000) {
    errors.description = "توضیحات نمی‌تواند بیش از 2000 کاراکتر باشد";
  }

  if (!data.priority) {
    errors.priority = "اولویت تیکت الزامی است";
  }

  if (data.attachments && data.attachments.length > MAX_ATTACHMENTS) {
    errors.attachments = `حداکثر ${MAX_ATTACHMENTS} فایل قابل آپلود است`;
  }

  return errors;
};

// Helper Functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      // Clear specific field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleFilesChange = useCallback(
    (files: File[]) => {
      setFormData((prev) => ({ ...prev, attachments: files }));
      // Clear attachment errors when user adds files
      if (errors.attachments) {
        setErrors((prev) => ({ ...prev, attachments: undefined }));
      }
    },
    [errors.attachments]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isMounted) return;

      // Clear previous errors
      setErrors({});

      // Validate form
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        // Cancel any ongoing requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Upload files if any
        const uploadedFiles: any[] = [];
        if (formData.attachments && formData.attachments.length > 0) {
          for (const file of formData.attachments) {
            const validation = validateFile(file);
            if (!validation.isValid) {
              setErrors({ attachments: validation.error });
              return;
            }

            const uploadFormData = new FormData();
            uploadFormData.append("file", file);

            try {
              const response = await fetch("/api/support-chat/public/upload", {
                method: "POST",
                body: uploadFormData,
                signal: abortControllerRef.current.signal,
              });

              if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
              }

              const result = await response.json();
              uploadedFiles.push(result);
            } catch (error) {
              if (error instanceof Error && error.name === "AbortError") {
                return; // Request was cancelled
              }
              throw error;
            }
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
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to create ticket");
        }

        const ticket = await response.json();

        if (isMounted) {
          onSubmit(ticket);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return; // Request was cancelled
        }
        console.error("Error creating ticket:", error);
        if (isMounted) {
          setErrors({
            general: "خطا در ایجاد تیکت. لطفاً دوباره تلاش کنید.",
          });
        }
      } finally {
        if (isMounted) {
          setIsSubmitting(false);
        }
      }
    },
    [formData, onSubmit, isMounted]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized form validation
  const isFormValid = useMemo(() => {
    const validationErrors = validateForm(formData);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  return (
    <form
      onSubmit={handleSubmit}
      className={`h-full flex flex-col ${className}`}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <FormHeader onCancel={onCancel} />

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
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
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Subject */}
        <div>
          <Input2
            name="subject"
            label="عنوان تیکت"
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            placeholder="موضوع تیکت خود را وارد کنید"
            required
            disabled={loading || isSubmitting}
            className="w-full"
            errorClassName={errors.subject ? "text-red-500" : ""}
          />
        </div>

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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.description
                ? "border-red-300 dark:border-red-600"
                : "border-gray-300 dark:border-slate-600"
            }`}
          />
          <p
            className={`mt-1 text-xs ${
              errors.description
                ? "text-red-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {errors.description ||
              `${formData.description.length}/1000 کاراکتر`}
          </p>
        </div>

        {/* Priority */}
        <div>
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
            onError={(error) => handleInputChange("priority", error)}
          />
        </div>

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
        <div>
          <FileUpload
            files={formData.attachments || []}
            onFilesChange={handleFilesChange}
            disabled={loading || isSubmitting}
          />
          {errors.attachments && (
            <p className="mt-1 text-xs text-red-500">{errors.attachments}</p>
          )}
        </div>
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

// Memoized component for performance
const MemoizedNewTicketForm = React.memo(
  NewTicketForm,
  (prevProps, nextProps) => {
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.className === nextProps.className
    );
  }
);

MemoizedNewTicketForm.displayName = "NewTicketForm";

export default MemoizedNewTicketForm;
export type { NewTicketFormProps };

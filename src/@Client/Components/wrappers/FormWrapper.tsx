import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Form } from "ndui-ahrom";
import React, { ReactNode } from "react";
import { z } from "zod";

interface FormWrapperProps {
  title: string;
  subtitle?: string;
  schema: z.ZodType<any, any>;
  defaultValues?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  children: ReactNode;
  className?: string;
  cardClassName?: string;
  submitIcon?: ReactNode;
  cancelIcon?: ReactNode;
}

const FormWrapper: React.FC<FormWrapperProps> = ({
  title,
  subtitle,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "ذخیره",
  cancelLabel = "انصراف",
  isLoading = false,
  error = null,
  success = null,
  children,
  className = "",
  cardClassName = "",
  submitIcon = <DIcon icon="fa-save" cdi={false} classCustom="ml-2" />,
  cancelIcon = <DIcon icon="fa-times" cdi={false} classCustom="ml-2" />,
}) => {
  return (
    <div className={className}>
      <div className={cardClassName}>
        <div className="p-2 px-4">
          {title && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <Form
            schema={schema}
            onSubmit={onSubmit}
            defaultValues={defaultValues}
          >
            <div className="space-y-4">
              {children}

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} icon={submitIcon}>
                  {isLoading ? "در حال پردازش..." : submitLabel}
                </Button>

                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isLoading}
                    icon={cancelIcon}
                  >
                    {cancelLabel}
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default FormWrapper;

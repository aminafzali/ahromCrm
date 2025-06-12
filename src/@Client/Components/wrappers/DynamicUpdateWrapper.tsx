import { Card } from "ndui-ahrom";
import Link from "next/link";
import { FormConfig } from "../../types/form";
import DIcon from "../common/DIcon";
import DynamicFormWrapper from "./DynamicFormWrapper";

interface DynamicUpdateWrapperProps<T> {
  title: string;
  backUrl: string;
  backLabel?: string;
  formConfig: FormConfig;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  entityId?: string | number;
  onDelete?: () => void;
  deleteConfirmMessage?: string;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
}

const DynamicUpdateWrapper = <T,>({
  title,
  backUrl,
  backLabel = "بازگشت",
  formConfig,
  defaultValues,
  onSubmit,
  entityId,
  onDelete,
  deleteConfirmMessage = "آیا از حذف این مورد اطمینان دارید؟",
  isLoading = false,
  error = null,
  success = null,
  submitLabel = "بروزرسانی",
  submitIcon = <DIcon icon="fa-save" cdi={false} classCustom="ml-2" />,
}: DynamicUpdateWrapperProps<T>) => {
  const handleDelete = () => {
    if (onDelete && window.confirm(deleteConfirmMessage)) {
      onDelete();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href={backUrl}>
            <button className="btn btn-ghost">
              <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
              {backLabel}
            </button>
          </Link>
          {/* <h1 className="text-lg font-bold">{title}</h1> */}
          {entityId && (
            <span className="mr-2 text-gray-500">#{entityId.toString()}</span>
          )}
        </div>
      </div>

      <Card>
        <DynamicFormWrapper
          config={formConfig}
          title=""
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          isLoading={isLoading}
          error={error}
          success={success}
          submitLabel={submitLabel}
          submitIcon={submitIcon}
        />
      </Card>
    </div>
  );
};

export default DynamicUpdateWrapper;

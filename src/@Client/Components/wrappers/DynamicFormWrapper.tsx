import { ButtonSelectWithTable, DropdownV2, Input, Select } from "ndui-ahrom";
import { FormWrapper } from ".";
import { FormConfig, FormField } from "../../types/form";
import DIcon from "../common/DIcon";

interface DynamicFormWrapperProps {
  config: FormConfig;
  title: string;
  submitLabel?: string;
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: any;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  backUrl?: string;
  submitIcon?: React.ReactNode;
}

const DynamicFormWrapper: React.FC<DynamicFormWrapperProps> = ({
  config,
  title,
  submitLabel = "ذخیره",
  onSubmit,
  defaultValues,
  isLoading = false,
  error = null,
  success = null,
  backUrl,
  submitIcon = <DIcon icon="fa-save" cdi={false} classCustom="ml-2" />,
}) => {
  const renderField = (field: FormField) => {
    switch (field.type) {
      case "dataTable":
        return (
          <ButtonSelectWithTable
            key={field.name}
            name={field.name}
            label={field.label}
            columns={field.columns || []}
            data={field.data || []}
            modalTitle={field.label}
            tableProps={field.tableProps}
            value={defaultValues?.[field.name] || []}
            selectionMode={field.multiple ? "multiple" : "single"}
            onSelect={function (selectedItems: any[]): void {}}
            iconViewMode={{
              remove: (
                <DIcon icon="fa-times" cdi={false} classCustom="text-error" />
              ),
            }}
          />
        );

      case "dropdown":
        return (
          <DropdownV2
            key={field.name}
            name={field.name}
            label={field.label}
            options={field?.options ? field?.options : []}
            placeholder={field.placeholder}
            className={field.className}
            isMulti={field.multiple}
            onChange={(value) => {
              if (field.onChange) {
                field.onChange(value);
              }
            }}
            allowCreate
            onCreateOption={(value) => {
              if (field.onCreateOption) {
                field.onCreateOption(value);
              }
            }}
          />
        );

      case "select":
        return (
          <Select
            key={field.name}
            name={field.name}
            label={field.label}
            value={field.defaultValue}
            options={field?.options ? field?.options : []}
            placeholder={field.placeholder}
            className={field.className}
          />
        );

      case "textarea":
        return (
          <Input
            key={field.name}
            name={field.name}
            label={field.label}
            placeholder={field.placeholder}
            className={field.className}
            type="textarea"
          />
        );

      default:
        return (
          <Input
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            className={field.className}
            append={field.append}
            prepend={field.prepend}
          />
        );
    }
  };

  const getGridClass = () => {
    const cols = config.layout?.columns || 1;
    switch (cols) {
      case 2:
        return "grid-cols-1 lg:grid-cols-2";
      case 3:
        return "grid-cols-1 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 lg:grid-cols-4";
      default:
        return "grid-cols-1";
    }
  };

  return (
    <FormWrapper
      title={title}
      schema={config.validation}
      onSubmit={onSubmit}
      defaultValues={defaultValues}
      isLoading={isLoading}
      error={error}
      success={success}
      submitLabel={submitLabel}
      submitIcon={submitIcon}
    >
      <div className={`grid ${getGridClass()} gap-${config.layout?.gap || 4}`}>
        {config.fields
          .filter((field) => !field.hidden)
          .map((field) => (
            <div
              key={field.name}
              className={
                field.col
                  ? `col-span-${Math.min(field.col, 2)} lg:col-span-${
                      field.col
                    }`
                  : ""
              }
            >
              {renderField(field)}
            </div>
          ))}
      </div>
    </FormWrapper>
  );
};

export default DynamicFormWrapper;

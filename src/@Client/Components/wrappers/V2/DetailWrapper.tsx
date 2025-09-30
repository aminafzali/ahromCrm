import DIcon from "@/@Client/Components/common/DIcon";
import { ActionButton } from "@/@Client/types";
import { Button, Card, Table } from "ndui-ahrom";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import ButtonDelete from "../../common/ButtonDelete";
import Loading from "../../common/Loading";
import TabsWrapper from "../TabsWrapper";

interface DetailPageWrapperProps {
  data: Record<string, any>;
  title?: string;
  excludeFields?: string[];
  customLabels?: Record<string, string>;
  customRenderers?: Record<string, (value: any) => ReactNode>;
  actionButtons?: ActionButton[];
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  onDelete?: (row: any) => void;
  editUrl?: string;
  showDefaultActions?: boolean;
}

const DetailWrapper: React.FC<DetailPageWrapperProps> = ({
  data = {},
  title,
  excludeFields = [],
  customLabels = {},
  customRenderers = {},
  actionButtons = [],
  loading = false,
  error = null,
  success = null,
  onDelete,
  editUrl,
  showDefaultActions = true,
}) => {
  const { t } = useTranslation();

  const formatLabel = (key: string): string => t(customLabels[key] || key);

  const isObjectArray = (value: any): boolean => {
    return Array.isArray(value);
  };

  const renderSimpleValue = (key: any, value: any): ReactNode => {
    if (customRenderers[key]) {
      return customRenderers[key](value);
    }
    if (customRenderers[value]) return customRenderers[value](value);
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "بله" : "خیر";
    return String(value);
  };

  const generateColumns = (data: any[]): Column[] => {
    // if (!data.length) return [];
    return Object.keys(data[0]).map((key) => ({
      name: key,
      field: key,
      label: formatLabel(key),
      render: (row) => renderSimpleValue(key, row[key]),
    }));
  };

  const getDefaultActions = (): ActionButton[] => {
    const defaultActions: ActionButton[] = [];
    if (editUrl) {
      defaultActions.push({
        label: "ویرایش",
        href: editUrl,
        icon: <DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />,
        variant: "primary",
      });
    }
    return defaultActions;
  };

  const allActionButtons = showDefaultActions
    ? [...getDefaultActions(), ...actionButtons]
    : actionButtons;

  const tabs = Object.entries(data)
    .filter(
      ([key, value]) =>
        !excludeFields.includes(key) &&
        (isObjectArray(value) || (typeof value === "object" && value !== null))
    )
    .map(([key, value]) => ({
      id: key,
      label: formatLabel(key),
      content: Array.isArray(value) ? (
        value.length > 0 ? (
          <Table
            columns={generateColumns(value)}
            data={value}
            defaultViewMode="table"
            showIconViews={false}
          />
        ) : (
          <p className="w-full text-error text-center p-4">داده ای یافت نشد</p>
        )
      ) : (
        <Card className="p-4">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey} className="my-2 flex">
              <span className="font-medium text-primary mx-2">
                {formatLabel(subKey)}:
              </span>
              <span>{renderSimpleValue(subKey, subValue)}</span>
            </div>
          ))}
        </Card>
      ),
    }));

  const renderFieldValue = (key: string, value: any): ReactNode => {
    if (customRenderers[key]) {
      return customRenderers[key](value);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full pb-8">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        {allActionButtons.map((button, index) =>
          button.href ? (
            <Link href={button.href} key={index}>
              <Button
                variant={button.variant || "primary"}
                icon={button.icon}
                disabled={button.disabled}
              >
                {button.label}
              </Button>
            </Link>
          ) : (
            <Button
              key={index}
              variant={button.variant || "primary"}
              icon={button.icon}
              onClick={button.onClick}
              disabled={button.disabled}
            >
              {button.label}
            </Button>
          )
        )}
        {onDelete && <ButtonDelete row={data} onDelete={onDelete} />}
      </div>

      <Card className="p-4 mt-4">
        {Object.entries(data)
          .filter(([key]) => !excludeFields.includes(key))
          .map(([key, value]) => {
            if (
              isObjectArray(value) ||
              (typeof value === "object" && value !== null)
            )
              return null;
            return (
              <div key={key} className="flex my-2">
                <span className="font-semibold text-gray-900 ml-4">
                  {formatLabel(key)}:
                </span>
                <span className="text-gray-700">
                  {renderSimpleValue(key, value)}
                </span>
              </div>
            );
          })}
      </Card>

      <div className="">
        {Object.entries(data)
          .filter(([key]) => key)
          .map(([key, value]) => {
            if (
              isObjectArray(value) ||
              (typeof value === "object" &&
                value !== null &&
                !Array.isArray(value))
            ) {
              return (
                <div key={key} className="col-span-2">
                  {renderFieldValue(key, value)}
                </div>
              );
            }
          })}
      </div>

      {tabs.length > 0 && <TabsWrapper tabs={tabs} className="mt-6" />}
    </div>
  );
};

export default DetailWrapper;

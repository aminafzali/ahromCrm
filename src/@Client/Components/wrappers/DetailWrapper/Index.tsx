import DIcon from "@/@Client/Components/common/DIcon";
import { ActionButton, CreateActionButton } from "@/@Client/types";
import ButtonCreate from "@/components/ButtonCreate/ButtonCreate";
import { Button, Card, Table } from "ndui-ahrom";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import ButtonDelete from "../../common/ButtonDelete";
import Loading from "../../common/Loading";
import TabsWrapper from "../TabsWrapper";
import TopViews from "./TopViews";
import { ignore, tops } from "./views";

interface DetailPageWrapperProps {
  data: Record<string, any>;
  title?: string;
  fieldName?: string;
  excludeFields?: string[];
  customLabels?: Record<string, string>;
  customRenderers?: Record<string, (value: any | string | []) => ReactNode>;
  actionButtons?: ActionButton[];
  createActionButtons?: CreateActionButton[];
  headerContent?: ReactNode;
  className?: string;
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
  createActionButtons = [],
  headerContent,
  className = "",
  fieldName = "name",
  loading = false,
  error = null,
  success = null,
  onDelete,
  editUrl,
  showDefaultActions = true,
}) => {
  const { t } = useTranslation();

  const excludeFieldsMerged = [...excludeFields, ...ignore, ...tops];

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
    const sample = data[0];
    return Object.keys(sample).map((key) => ({
      name: key,
      field: key,
      label: formatLabel(key),
      render: (row) => renderSimpleValue(key, row[key]),
    }));
  };

  const renderFieldValue = (key: string, value: any): ReactNode => {
    if (tops.includes(key)) {
      return <></>;
    }
    if (ignore.includes(key)) {
      return <></>;
    }
    if (customRenderers[key]) {
      return customRenderers[key](value);
    }

    return <></>;
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
        !excludeFieldsMerged.includes(key) &&
        !(key in customRenderers) && // Corrected condition
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-2 mt-4 md:mt-0 mb-2 md:mb-2">
        {createActionButtons.map((button, index) => (
          <ButtonCreate
            key={index}
            variant={button.variant || "primary"}
            icon={button.icon}
            disabled={button.disabled}
            {...button}
          >
            {button.label}
          </ButtonCreate>
        ))}
        {allActionButtons.map((button, index) =>
          button.href ? (
            <Link href={button.href} key={index}>
              <Button
                variant={button.variant || "primary"}
                icon={button.icon}
                outline={button.outline}
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
      {headerContent && <div className="w-full p-2  mb-4">{headerContent}</div>}

      <div className="mt-4">
        <div className="p-2">
          <div className="flex mb-6 gap-2 items-center">
            <Link href="./">
              <h2 className="text-lg text-primary ">{title}</h2>
            </Link>
            <DIcon icon="fa-angle-left" classCustom="fa-regular" />
            <h2 className="text-lg ">
              {data[fieldName] ? data[fieldName] : ` شماره #${data.id}`}
            </h2>
          </div>
          <div className="lg:flex flex-row-reverse gap-4">
            <div className="basis-1/3 w-full mb-4">
              <TopViews data={data} />
            </div>
            <div className="basis-2/3 w-full">
              <Card className="p-4">
                {Object.entries(data)
                  .filter(([key]) => !excludeFieldsMerged.includes(key))
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
            </div>
          </div>

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
      </div>
    </div>
  );
};

export default DetailWrapper;

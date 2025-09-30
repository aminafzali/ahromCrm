// src/modules/received-devices/components/SelectDeviceType.tsx

"use client";
import DIcon from "@/@Client/Components/common/DIcon";
import SelectFromTable from "@/@Client/Components/wrappers/Select22";
import { columnsForSelect as deviceTypeColumns } from "@/modules/device-types/data/table";
import { useDeviceType } from "@/modules/device-types/hooks/useDeviceType";
import { DeviceType } from "@prisma/client";
import { ButtonSelectWithTable } from "ndui-ahrom";
import { useEffect, useState } from "react";

export default function SelectDeviceType(props: any) {
  const { getAll } = useDeviceType();
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);

  useEffect(() => {
    getAll({ page: 1, limit: 500 }).then((res) => setDeviceTypes(res.data));
  }, []);

  return (
    <div>
    <SelectFromTable
      {...props}
      options={deviceTypes} // اصلاح اصلی: استفاده از پراپ options
      columns={deviceTypeColumns}
      placeholder="یک نوع دستگاه را انتخاب کنید"
    />
  <ButtonSelectWithTable
            key={"DeviceTypes"}
            name={"DeviceTypes"}
            label={"DeviceTypes"}
            columns={deviceTypeColumns || []}
            data={deviceTypes || []}
            modalTitle={"DeviceTypes"}
            // tableProps={field.tableProps}
            // value={defaultValues?.[field.name] || []}
            selectionMode={"single"}
            onSelect={function (selectedItems: any[]): void {}}
            iconViewMode={{
              remove: (
                <DIcon icon="fa-times" cdi={false} classCustom="text-error" />
              ),
            }}
          />
    </div>
  );
}

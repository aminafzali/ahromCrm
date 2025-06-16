// src/modules/received-devices/components/SelectBrand.tsx

"use client";
import SelectFromTable from "@/@Client/Components/wrappers/Select22";
import { columnsForSelect as brandColumns } from "@/modules/brands/data/table";
import { useBrand } from "@/modules/brands/hooks/useBrand";
import { Brand } from "@prisma/client";
import { useEffect, useState } from "react";

export default function SelectBrand(props: any) {
  const { getAll } = useBrand();
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    getAll({ page: 1, limit: 500 }).then((res) => setBrands(res.data));
  }, []);

  return (
    <SelectFromTable
      {...props}
      options={brands} // اصلاح اصلی: استفاده از پراپ options
      columns={brandColumns}
      placeholder="یک برند را انتخاب کنید"
    />
  );
}

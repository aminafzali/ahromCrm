"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { listItemRenderUser } from "@/modules/requests/data/table";
import { listItemRender } from "@/modules/workspace-users/data/table";
import { Button, Form, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { createReceivedDeviceSchema } from "../validation/schema";
import SelectBrand2 from "./SelectBrand2";
import SelectDeviceType2 from "./SelectDeviceType2";
import SelectRequest2 from "./SelectRequest2";
import SelectUser2 from "./SelectUser2";

interface ReceivedDeviceFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  loading?: boolean;
}

export default function ReceivedDevice2Form({
  onSubmit,
  defaultValues = {},
  loading = false,
}: ReceivedDeviceFormProps) {
  const [req, setReq] = useState<any | null>(defaultValues.request || null);
  // بنظر می آید این خط ایرادی داشته باشد TODO:
  const [user, setUser] = useState<any | null>(defaultValues.user || null);
  // TODO: احتمالا نیاز به اصلاح دارد
  // برای برند و برای دوایس تایپ مشابه بالا نوشته شود
  const [brand, setBrand] = useState<any | null>(defaultValues.brand || null);
  const [deviceType, setDeviceType] = useState<any | null>(
    defaultValues.deviceType || null
  );

  const [model, setModel] = useState<string>(defaultValues.model || "");
  const [problemDescription, setProblemDescription] = useState<string>(
    defaultValues.problemDescription || ""
  );
  const [initialCondition, setInitialCondition] = useState<string>(
    defaultValues.initialCondition || ""
  );

  const [error, setError] = useState<string | null>(null);
  // سرویس تایپ فعلا استفاده ای ندارد برای همین کامنت شد
  //const { getAll: getAll, loading: loadingBrand } = useBrand();
  // const [brands, setBrands] = useState<Brand[]>([]);

  const get = async () => {
    // const b = await getAll();
    // setBrands(b.data);
  };

  useEffect(() => {
    get();
  }, []);

  const onSetRequest = (selectedItem: any) => {
    setReq(selectedItem);
    setUser((selectedItem as any).workspaceUser);
  };

  const onSetUser = (selectedItem: any) => {
    setUser(selectedItem);
  };

  const onSetBrand = (selectedItem: any) => {
    setBrand(selectedItem);
  };
  const onSetDeviceType = (selectedItem: any) => {
    setDeviceType(selectedItem);
  };
  // const onSetModel = (selectedItem: any) => {
  //   setModel(selectedItem);
  // };

  const handleSubmit = () => {
    try {
      const data = {
        model,
        problemDescription,
        initialCondition,
      };
      if (req) data["request"] = req;
      if (user) data["workspaceUser"] = user;
      if (deviceType) data["deviceType"] = deviceType;
      if (brand) data["brand"] = brand;

      console.log(data);

      const validation = createReceivedDeviceSchema.safeParse(data);

      console.log(validation);

      if (!validation.success) {
        setError("لطفاً همه موارد را به درستی تکمیل کنید");
        return;
      }

      onSubmit(data);
    } catch {
      setError("خطا در ثبت دستگاه های دریافتی");
    }
  };
  // TODO: بنظر می آید این خط زیر ناقص می باشد
  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="p-2 flex flex-col gap-4">
        <div className="flex gap-2">
          {!req && <SelectRequest2 onSelect={onSetRequest} />}
          {req && (
            <Button
              className="w-fit text-error"
              variant="ghost"
              onClick={() => setReq(null)}
            >
              حذف درخواست
            </Button>
          )}
        </div>
        {req && listItemRenderUser(req)}
      </div>
      <div className="p-2 flex flex-col gap-4">
        <div className="flex gap-2">
          {!req && !user && <SelectUser2 onSelect={onSetUser} />}

          {user && !req && (
            <Button
              className="w-fit text-error "
              variant="ghost"
              onClick={() => setUser(null)}
            >
              حذف کاربر
            </Button>
          )}
        </div>
        {user && listItemRender(user)}
      </div>

      <Form schema={createReceivedDeviceSchema} onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-4">ویژگی ها</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="problemDescription"
                label="توضیح مشکل"
                type="textarea"
                value={problemDescription}
                onChange={(e) => {
                  setProblemDescription("" + e.target.value);
                }}
              />
              <Input
                name="initialCondition"
                label="شرح وضعیت ظاهری"
                type="textarea"
                value={initialCondition}
                onChange={(e) => {
                  setInitialCondition("" + e.target.value);
                }}
              />
              <Input
                name="model"
                label="مدل"
                type="textarea"
                value={model}
                onChange={(e) => {
                  setModel("" + e.target.value);
                }}
              />

              <SelectBrand2 value={brand} onSelect={onSetBrand} />
              <SelectDeviceType2
                value={deviceType}
                onSelect={onSetDeviceType}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="button"
              //TODO: خط زیر نیاز به اصلاح دارد
              disabled={loading}
              onClick={handleSubmit}
              icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
            >
              {loading ? "در حال ثبت..." : "ثبت دستگاه دریافتی"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

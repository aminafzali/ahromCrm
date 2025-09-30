// src/modules/received-devices/components/ReceivedDeviceForm.tsx

"use client";

import { RequestWithRelations } from "@/modules/requests/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useReceivedDevice } from "../hooks/useReceivedDevice";
import { createReceivedDeviceSchema } from "../validation/schema";
import SelectBrand from "./SelectBrand";
import SelectDeviceType from "./SelectDeviceType";
import SelectRequest from "./SelectRequest";
import SelectUser from "./SelectUser";

type FormValues = z.infer<typeof createReceivedDeviceSchema>;

export default function ReceivedDeviceForm({
  afterSubmit,
}: {
  afterSubmit?: () => void;
}) {
  const router = useRouter();
  const { create, submitting } = useReceivedDevice();

  const methods = useForm<FormValues>({
    resolver: zodResolver(createReceivedDeviceSchema),
    defaultValues: { request: undefined, user: undefined },
  });

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;
  const watchedRequest = watch("request") as RequestWithRelations | null;

  useEffect(() => {
    if (watchedRequest && watchedRequest.id && watchedRequest.user) {
      setValue("user", watchedRequest.user, { shouldValidate: true });
    }
  }, [watchedRequest, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      await create(data);
      if (afterSubmit) afterSubmit();
      else router.push("/dashboard/received-devices");
    } catch (error) {
      console.error("Error creating received device:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
          <div className="form-control">
            <label className="label">
              <span className="label-text">درخواست مرتبط (اختیاری)</span>
            </label>
            <Controller
              name="request"
              control={control}
              render={({ field }) => <SelectRequest {...field} />}
            />
            {errors.request && (
              <p className="text-error text-xs mt-1">
                {(errors.request as any)?.message}
              </p>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">مشتری</span>
            </label>
            <Controller
              name="user"
              control={control}
              render={({ field }) => (
                <SelectUser {...field} disabled={!!watchedRequest} />
              )}
            />
            {errors.user && (
              <p className="text-error text-xs mt-1">
                {(errors.user as any)?.message}
              </p>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">نوع دستگاه</span>
            </label>
            <Controller
              name="deviceType"
              control={control}
              render={({ field }) => <SelectDeviceType {...field} />}
            />
            {errors.deviceType && (
              <p className="text-error text-xs mt-1">
                {(errors.deviceType as any)?.message}
              </p>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">برند</span>
            </label>
            <Controller
              name="brand"
              control={control}
              render={({ field }) => <SelectBrand {...field} />}
            />
            {errors.brand && (
              <p className="text-error text-xs mt-1">
                {(errors.brand as any)?.message}
              </p>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">مدل</span>
            </label>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  value={field.value || ""}
                  className="input input-bordered w-full"
                />
              )}
            />
            {errors.model && (
              <p className="text-error text-xs mt-1">{errors.model.message}</p>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">شماره سریال</span>
            </label>
            <Controller
              name="serialNumber"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  value={field.value || ""}
                  className="input input-bordered w-full"
                />
              )}
            />
            {errors.serialNumber && (
              <p className="text-error text-xs mt-1">
                {errors.serialNumber.message}
              </p>
            )}
          </div>

          <div className="form-control col-span-2">
            <label className="label">
              <span className="label-text">شرح مشکل</span>
            </label>
            <Controller
              name="problemDescription"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  value={field.value || ""}
                  className="textarea textarea-bordered w-full"
                />
              )}
            />
            {errors.problemDescription && (
              <p className="text-error text-xs mt-1">
                {errors.problemDescription.message}
              </p>
            )}
          </div>

          <div className="form-control col-span-2">
            <label className="label">
              <span className="label-text">وضعیت ظاهری اولیه</span>
            </label>
            <Controller
              name="initialCondition"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  value={field.value || ""}
                  className="textarea textarea-bordered w-full"
                />
              )}
            />
            {errors.initialCondition && (
              <p className="text-error text-xs mt-1">
                {errors.initialCondition.message}
              </p>
            )}
          </div>

          <div className="form-control col-span-2">
            <label className="label">
              <span className="label-text">توضیحات بیشتر</span>
            </label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  value={field.value || ""}
                  className="textarea textarea-bordered w-full"
                />
              )}
            />
            {errors.notes && (
              <p className="text-error text-xs mt-1">{errors.notes.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button type="button" className="btn" onClick={() => router.back()}>
            انصراف
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "در حال ایجاد..." : "ایجاد دستگاه"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

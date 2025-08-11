// مسیر فایل: src/modules/payment-categories/views/view/update/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { Button, Form, Input, Select as RawSelect } from "ndui-ahrom";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePaymentCategory } from "../../../hooks/usePaymentCategory";
import { updatePaymentCategorySchema } from "../../../validation/schema";
import PaymentCategorySelect from "../../../components/PaymentCategorySelect";
import { z } from "zod";

type FormData = z.infer<typeof updatePaymentCategorySchema>;

export default function UpdatePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { getById, update, submitting, error, loading: dataLoading } = usePaymentCategory();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(updatePaymentCategorySchema),
  });
  
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getById(id);
        if (data) {
          const formattedData = {
            ...data,
            parent: data.parentId ? { id: data.parentId } : null,
          };
          reset(formattedData);
        }
      } catch (err) {
        console.error("Failed to fetch category data", err);
      }
    };
    if (id) {
      fetchCategory();
    }
  }, [id, getById, reset]);

  const onSubmit = async (data: FormData) => {
    const finalData = {
      ...data,
      parentId: data.parent ? data.parent.id : null,
    };
    delete (finalData as any).parent;

    try {
      await update(id, finalData);
      router.push("/dashboard/payment-categories");
    } catch (err) {
      console.error("Error updating payment category:", err);
    }
  };

  if (dataLoading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ویرایش دسته‌بندی پرداخت</h1>
      <Link
        href="/dashboard/payment-categories"
        className="flex justify-start items-center mb-6"
      >
        <button className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
          بازگشت به لیست
        </button>
      </Link>
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      <Form
        schema={updatePaymentCategorySchema}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg p-6 border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="name" label="نام دسته‌بندی" error={errors.name?.message} required />
          <Input name="slug" label="اسلاگ" error={errors.slug?.message} required />
           <RawSelect
            name="type"
            label="نوع"
            error={errors.type?.message}
            options={[
              { value: "INCOME", label: "درآمد" },
              { value: "EXPENSE", label: "هزینه" },
              { value: "TRANSFER", label: "انتقال" },
            ]}
            required
            {...register("type")}
          />
          <PaymentCategorySelect
            name="parent.id"
            label="دسته‌بندی والد (اختیاری)"
            value={watch("parent")?.id}
            onChange={(value) => setValue("parent", { id: Number(value) })}
          />
          <div className="md:col-span-2">
            <Input
              name="description"
              label="توضیحات"
              type="textarea"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={submitting}
            loading={submitting}
            icon={<DIcon icon="fa-save" cdi={false} classCustom="ml-2" />}
          >
            ذخیره تغییرات
          </Button>
        </div>
      </Form>
    </div>
  );
}
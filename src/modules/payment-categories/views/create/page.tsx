// مسیر فایل: src/modules/payment-categories/views/create/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { CreatePageProps } from "@/@Client/types/crud";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Select as RawSelect } from "ndui-ahrom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PaymentCategorySelect from "../../components/PaymentCategorySelect";
import { usePaymentCategory } from "../../hooks/usePaymentCategory";
import { createPaymentCategorySchema } from "../../validation/schema";

type FormData = z.infer<typeof createPaymentCategorySchema>;

export default function CreatePage({ after, back }: CreatePageProps) {
  const router = useRouter();
  const { create, submitting, error } = usePaymentCategory();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createPaymentCategorySchema),
  });

  const onSubmit = async (data: FormData) => {
    const finalData = {
      ...data,
      parentId: data.parent ? data.parent.id : null,
    };
    delete (finalData as any).parent;

    try {
      await create(finalData);
      if (after) {
        after();
      } else {
        router.push("/dashboard/payment-categories");
      }
    } catch (err) {
      console.error("Error creating payment category:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ایجاد دسته‌بندی پرداخت جدید</h1>
        {back && (
          <Link href="/dashboard/payment-categories" className="btn btn-ghost">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            بازگشت به لیست
          </Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <Form
        schema={createPaymentCategorySchema}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg p-6 border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            name="name"
            label="نام دسته‌بندی"
            error={errors.name?.message}
            required
          />
          <Input
            name="slug"
            label="اسلاگ"
            error={errors.slug?.message}
            required
          />
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
              placeholder="توضیحات مربوط به دسته‌بندی را وارد کنید..."
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
            ذخیره
          </Button>
        </div>
      </Form>
    </div>
  );
}

import { FormWrapper } from "@/@Client/Components/wrappers";
import { Input } from "ndui-ahrom";
import { z } from "zod";
import { useServiceType } from "../hooks/useServiceType";
import { createServiceTypeSchema } from "../validation/schema";
import { useRouter } from "next/navigation";

export default function ServiceTypeForm() {
    const router = useRouter();
  
  const { create, submitting:loading, error, success } = useServiceType();

  const handleSubmit = async (
    data: z.infer<typeof createServiceTypeSchema>
  ) => {
    try {
      data.basePrice = parseInt(data.basePrice)
      await create(data);
      router.push("/dashboard/service-types");
    } catch (error) {
      console.error("Error creating service type:", error);
    }
  };

  return (
    <FormWrapper
      title="نوع خدمت جدید"
      schema={createServiceTypeSchema}
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
      success={success}
    >
      <Input name="name" label="نام خدمت" placeholder="مثال: تعمیر یخچال" />
      <Input
        name="description"
        label="توضیحات"
        placeholder="توضیحات خدمت را وارد کنید"
      />
      <Input
        name="basePrice"
        label="قیمت پایه (تومان)"
        placeholder="مثال: 100000"
      />
    </FormWrapper>
  );
}

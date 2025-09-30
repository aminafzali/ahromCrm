import { FormWrapper } from "@/@Client/Components/wrappers";
import { Input } from "ndui-ahrom";
import { z } from "zod";
import { useStatus } from "../hooks/useStatus";
import { createStatusSchema } from "../validation/schema";
import { useRouter } from "next/navigation";

export default function StatusForm() {
    const router = useRouter();
  
  const { create, submitting:loading, error, success } = useStatus();

  const handleSubmit = async (data: z.infer<typeof createStatusSchema>) => {
    try {
      await create(data);
      router.push("/dashboard/statuses");
    } catch (error) {
      console.error("Error creating status:", error);
    }
  };

  return (
    <FormWrapper
      title="وضعیت جدید"
      schema={createStatusSchema}
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
      success={success}
    >
      <div className="flex gap-4">

      <Input 
        name="name" 

        label="نام وضعیت" 
        placeholder="مثال: در حال بررسی"
      />
      <Input 
        name="color" 
        label="رنگ" 
        type="color"
        placeholder="انتخاب رنگ"
      />
      </div>
    </FormWrapper>
  );
}
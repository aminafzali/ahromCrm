// مسیر فایل: src/modules/requests/components/PublicRequestForm.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { ServiceType } from "@prisma/client";
import { Button, Input } from "ndui-ahrom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { usePublicRequest } from "../hooks/usePublicRequest";
import AuthenticationStep2 from "./AuthenticationStep2"; // استفاده از کامپوننت جدید شما
import RequestSteps from "./RequestSteps";
import ServiceSelection2 from "./ServiceSelection2";

// ۱. تعریف schema پایه‌ای برای اعتبارسنجی‌های جزئی
const basePublicRequestSchema = z.object({
  serviceTypeId: z.number().min(1, "انتخاب نوع خدمات الزامی است."),
  description: z.string().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد."),
  address: z.string().optional(),
  workspaceId: z.number(),
  statusId: z.number(),
  userId: z.number().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

// ۲. تعریف schema نهایی با قانون refine برای اعتبارسنجی کامل
const finalPublicRequestSchema = basePublicRequestSchema.refine(
  (data) => {
    // اگر کاربر لاگین نیست (userId ندارد)، پس نام و شماره تماس مشتری الزامی است
    if (!data.userId) {
      return (
        !!data.customerName &&
        data.customerName.length >= 2 &&
        !!data.customerPhone &&
        data.customerPhone.length >= 10
      );
    }
    return true;
  },
  {
    message: "نام و شماره تماس برای کاربران مهمان الزامی است.",
    path: ["customerName"],
  }
);

interface PublicRequestFormProps {
  workspaceId: number;
  serviceTypes: ServiceType[];
  initialStatusId: number;
  slug: string;
}

export default function PublicRequestForm4({
  workspaceId,
  serviceTypes,
  initialStatusId,
  slug,
}: PublicRequestFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    create,
    submitting: loading,
    error,
    success,
    setError,
  } = usePublicRequest();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceTypeId: 0,
    description: "",
    address: "",
    userId: session?.user ? parseInt(session.user.id) : undefined,
    statusId: initialStatusId,
    workspaceId: workspaceId,
    // این دو فیلد در مرحله احراز هویت پر می‌شوند
    customerName: "",
    customerPhone: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        userId: parseInt(session.user.id),
      }));
    }
  }, [session]);

  if (status === "loading") return <Loading />;

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1 && !formData.serviceTypeId) {
      setError("لطفاً یک نوع خدمت را انتخاب کنید.");
      return;
    }
    if (currentStep === 2) {
      const validation = basePublicRequestSchema
        .pick({ description: true })
        .safeParse(formData);
      if (!validation.success) {
        setError(
          validation.error.flatten().fieldErrors.description?.[0] ||
            "توضیحات معتبر نیست."
        );
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleServiceSelect = (serviceTypeId: number) => {
    setFormData({ ...formData, serviceTypeId });
  };

  const handleSubmit = async () => {
    const finalData = { ...formData };

    // برای کاربران لاگین کرده، اسکیما را اعتبارسنجی می‌کنیم
    if (session) {
      const validation = finalPublicRequestSchema.safeParse(finalData);
      if (!validation.success) {
        const errorMessages = Object.values(
          validation.error.flatten().fieldErrors
        )
          .flat()
          .join("\n");
        setError(
          errorMessages || "لطفا تمام فیلدهای الزامی را به درستی پر کنید."
        );
        return;
      }
      await submitRequest(validation.data);
    } else {
      // برای کاربران مهمان، فقط اطلاعات فعلی را ذخیره و به مرحله بعد می‌رویم
      sessionStorage.setItem("pendingRequest", JSON.stringify(finalData));
      setCurrentStep(4);
    }
  };

  // ===== شروع بهبود ۲: اصلاح توابع برای استفاده از slug =====
  const handleAuthenticationSuccess = async (authData: { phone: string }) => {
    const storedData = sessionStorage.getItem("pendingRequest");
    if (!storedData) return;
    const finalData = {
      ...JSON.parse(storedData),
      customerPhone: authData.phone,
      customerName: `کاربر ${authData.phone}`,
    };
    await submitRequest(finalData);
    sessionStorage.removeItem("pendingRequest");
  };
  const submitRequest = async (dataToSubmit: any) => {
    try {
      const res: any = await create(dataToSubmit);
      toast.success("درخواست شما با موفقیت ثبت شد.");
      // از workspaceSlug برای ساخت URL صحیح استفاده می‌کنیم
      router.push(`/${slug}/request/${res?.id}`);
    } catch (err) {
      console.error("Error submitting request:", err);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection2
            onSelect={handleServiceSelect}
            selectedService={formData.serviceTypeId}
            serviceTypes={serviceTypes}
          />
        );
      case 2:
        return (
          <div className="space-y-4">
            <Input
              name="description"
              label="توضیحات درخواست"
              placeholder="لطفاً جزئیات کامل مشکل یا درخواست خود را اینجا بنویسید..."
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              value={formData.description}
              required
            />
            <Input
              name="address"
              label="آدرس (اختیاری)"
              placeholder="آدرس دقیق خود را وارد کنید"
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              value={formData.address}
            />
          </div>
        );
      case 3:
        return (
          <div className="p-6 bg-base-200/50 rounded-lg">
            <h3 className="text-xl font-bold mb-4">خلاصه درخواست</h3>
            <div className="space-y-3">
              <div>
                <strong>نوع خدمات:</strong>{" "}
                {serviceTypes.find((st) => st.id === formData.serviceTypeId)
                  ?.name || "-"}
              </div>
              <div>
                <strong>توضیحات:</strong>{" "}
                <p className="mt-1 text-base-content/80">
                  {formData.description}
                </p>
              </div>
              <div>
                <strong>آدرس:</strong> {formData.address || "ثبت نشده"}
              </div>
            </div>
          </div>
        );
      case 4:
        // این کامپوننت خودش شماره را می‌گیرد و فقط نتیجه را برمی‌گرداند
        return <AuthenticationStep2 onSuccess={handleAuthenticationSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-2 max-w-2xl mx-auto">
      <RequestSteps currentStep={currentStep} onStepChange={setCurrentStep} />

      {error && (
        <div className="alert alert-error my-4 shadow-lg">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success my-4 shadow-lg">
          <span>{success}</span>
        </div>
      )}

      <div className="my-6 min-h-[250px]">{renderStepContent()}</div>

      {currentStep < 4 && (
        <div className="flex justify-between items-center my-4">
          <div>
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
                بازگشت
              </Button>
            )}
          </div>
          <div>
            {currentStep === 3 ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                <DIcon icon="fa-check" cdi={false} classCustom="ml-2" />
                {loading ? "در حال ارسال..." : "تایید و ثبت نهایی"}
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNextStep}>
                مرحله بعد
                <DIcon icon="fa-arrow-left" cdi={false} classCustom="mr-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

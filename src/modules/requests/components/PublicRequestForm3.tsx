// مسیر فایل: src/modules/requests/components/PublicRequestForm3.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { ServiceType } from "@prisma/client";
import { Button, Input } from "ndui-ahrom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequest } from "../hooks/useRequest";
import { createRequestSchema } from "../validation/schema";
import AuthenticationStep from "./AuthenticationStep";
import RequestSteps from "./RequestSteps";
import ServiceSelection2 from "./ServiceSelection2";

interface PublicRequestFormProps {
  workspaceId: number;
  workspaceSlug: string;
  serviceTypes: ServiceType[];
  initialStatusId: number;
}

export default function PublicRequestForm3({
  workspaceId,
  workspaceSlug,
  serviceTypes,
  initialStatusId,
}: PublicRequestFormProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const {
    create,
    submitting: loading,
    error,
    success,
    setError,
  } = useRequest();

  // در فرم عمومی، همیشه با مرحله انتخاب سرویس (مرحله ۱) شروع می‌کنیم
  const [currentStep, setCurrentStep] = useState(1);

  // state برای نگهداری داده‌های فرم، دقیقاً مشابه RequestForm
  const [formData, setFormData] = useState({
    serviceTypeId: 0,
    description: "",
    address: "",
    userId: parseInt(session?.user?.id || "0"),
    statusId: initialStatusId,
    workspaceId: workspaceId,
  });

  useEffect(() => {
    // اگر کاربر در حین پر کردن فرم لاگین کرد، userId را آپدیت می‌کنیم
    if (session?.user) {
      setFormData((prev) => ({ ...prev, userId: parseInt(session.user.id) }));
    }
  }, [session]);

  if (sessionStatus === "loading") return <Loading />;

  // توابع هندلر دقیقاً مانند RequestForm
  const handleNextStep = async () => {
    if (currentStep === 2) {
      // اعتبارسنجی قبل از رفتن به مرحله خلاصه
      const validation = createRequestSchema
        .pick({ description: true })
        .safeParse(formData);
      if (!validation.success) {
        setError(
          validation.error.flatten().fieldErrors.description?.[0] ||
            "خطا در اعتبارسنجی"
        );
        return;
      }
    }
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handleServiceSelect = (serviceTypeId: number) => {
    setFormData({ ...formData, serviceTypeId });
  };

  const handleSubmit = async (dataFromForm: any) => {
    try {
      const finalData = { ...formData, ...dataFromForm };

      if (!session) {
        sessionStorage.setItem("pendingRequest", JSON.stringify(finalData));
        setCurrentStep(4); // نمایش مرحله احراز هویت
        return;
      }

      finalData.userId = parseInt(session.user.id);

      const validation = createRequestSchema.safeParse(finalData);
      if (!validation.success) {
        const errorMessages = Object.values(
          validation.error.flatten().fieldErrors
        )
          .flat()
          .join("\n");
        setError(errorMessages);
        return;
      }

      const res: any = await create(validation.data);
      if (res?.id) {
        router.push(`/${workspaceSlug}/request/${res.id}`); // هدایت به صفحه مشاهده درخواست
      }
    } catch (err) {
      console.error("Error submitting request:", err);
    }
  };

  const handleAuthenticationSuccess = async (newUserId: number) => {
    try {
      const storedData = sessionStorage.getItem("pendingRequest");
      if (!storedData) return;

      const requestData = {
        ...JSON.parse(storedData),
        userId: newUserId,
      };

      await handleSubmit(requestData); // handleSubmit را با داده‌های کامل فراخوانی می‌کنیم

      sessionStorage.removeItem("pendingRequest");
    } catch (error) {
      console.error("Error submitting request after authentication:", error);
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
        // Note: The original form uses a <Form> wrapper here.
        // For simplicity and direct control, we use standard inputs.
        // If complex validation is needed here, this can be wrapped in a <Form> component.
        return (
          <div className="space-y-4">
            <Input
              name="description"
              className="bg-white"
              label="توضیحات"
              placeholder="جزئیات درخواست را شرح دهید"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
            <Input
              name="address"
              label="آدرس (اختیاری)"
              placeholder="آدرس دقیق خود را وارد کنید"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
        );
      case 3:
        return (
          <div className="p-6 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">خلاصه درخواست</h3>
            <div className="space-y-4">
              <div>
                <strong>نوع خدمات:</strong>{" "}
                {serviceTypes.find((st) => st.id === formData.serviceTypeId)
                  ?.name || "-"}
              </div>
              <div>
                <strong>توضیحات:</strong>
                <div className="mt-2">{formData.description}</div>
              </div>
              <div>
                <strong>آدرس:</strong> {formData.address || "ثبت نشده"}
              </div>
            </div>
          </div>
        );
      case 4:
        return <AuthenticationStep onSuccess={handleAuthenticationSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-2 max-w-2xl mx-auto">
      {currentStep < 4 && (
        <RequestSteps currentStep={currentStep} onStepChange={setCurrentStep} />
      )}

      {error && <div className="alert alert-danger my-4">{error}</div>}
      {success && <div className="alert alert-success my-4">{success}</div>}

      <div className="my-6">{renderStepContent()}</div>

      {currentStep < 4 && (
        <div className="flex justify-between my-4">
          {currentStep > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
              بازگشت
            </Button>
          ) : (
            <div />
          )}{" "}
          {/* Empty div to maintain layout */}
          {currentStep === 3 ? (
            <Button onClick={() => handleSubmit(formData)} disabled={loading}>
              <DIcon icon="fa-check" cdi={false} classCustom="ml-2" />
              {loading ? "در حال ثبت..." : "تایید و ثبت نهایی"}
            </Button>
          ) : currentStep < 3 ? (
            <Button
              onClick={handleNextStep}
              disabled={currentStep === 1 && !formData.serviceTypeId}
            >
              مرحله بعد
              <DIcon icon="fa-arrow-left" cdi={false} classCustom="mr-2" />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

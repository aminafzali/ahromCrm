// مسیر فایل: src/modules/requests/components/PublicRequestForm.tsx
"use client";

import Loading from "@/@Client/Components/common/Loading";
import { ServiceType } from "@prisma/client";
import { Button, Input } from "ndui-ahrom";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { z } from "zod";
import AuthenticationStep2 from "./AuthenticationStep2";
import RequestSteps from "./RequestSteps";
import ServiceSelection2 from "./ServiceSelection2";

interface PublicRequestFormProps {
  workspaceId: number;
  serviceTypes: ServiceType[];
  initialStatusId: number;
}

const publicRequestSchema = z.object({
  serviceTypeId: z.number().min(1, "نوع خدمات را انتخاب کنید"),
  description: z.string().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
  address: z.string().optional(),
});

type FormData = Partial<z.infer<typeof publicRequestSchema>>;

export default function PublicRequestForm({
  workspaceId,
  serviceTypes,
  initialStatusId,
}: PublicRequestFormProps) {
  const {
    data: session,
    status: sessionStatus,
    update: updateSession,
  } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});

  if (status === "loading") return <Loading />;

  const handleNextStep = () => {
    if (currentStep === 2) {
      const validation = publicRequestSchema
        .pick({ description: true, address: true })
        .safeParse(formData);
      if (!validation.success) {
        const fieldErrors = validation.error.flatten().fieldErrors;
        setError(
          fieldErrors.description?.[0] ||
            fieldErrors.address?.[0] ||
            "خطا در اعتبارسنجی"
        );
        return;
      }
    }
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handleFinalSubmit = async (authData?: { phone: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const finalAuthData =
      authData || (session ? { phone: session.user.phone } : null);

    if (!finalAuthData) {
      setError("امکان احراز هویت وجود ندارد.");
      setLoading(false);
      return;
    }

    const finalRequestData = {
      ...formData,
      statusId: initialStatusId,
      workspaceId: workspaceId,
    };

    const validation = publicRequestSchema.safeParse(finalRequestData);
    if (!validation.success) {
      const errorMessages = Object.values(
        validation.error.flatten().fieldErrors
      )
        .flat()
        .join("\n");
      setError(errorMessages);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/public/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestData: validation.data,
          authData: finalAuthData,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || "خطا در ثبت درخواست");
      }

      setSuccess(
        "درخواست شما با موفقیت ثبت شد! در حال انتقال به پنل کاربری..."
      );
      if (!session) {
        await updateSession();
      }
      // تاخیر کوتاه برای نمایش پیام موفقیت قبل از ریدایرکت
      setTimeout(() => {
        window.location.href = "/panel/requests";
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // این تابع جدید برای هماهنگی با AuthenticationStep است
  const handleAuthSuccess = (authResult: { phone: string }) => {
    handleFinalSubmit(authResult);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection2
            onSelect={(serviceTypeId) =>
              setFormData((prev) => ({ ...prev, serviceTypeId }))
            }
            selectedService={formData.serviceTypeId}
            serviceTypes={serviceTypes}
          />
        );
      case 2:
        return (
          <div className="space-y-4">
            <Input
              name="description"
              label="توضیحات"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <Input
              name="address"
              label="آدرس (اختیاری)"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>
        );
      case 3:
        return (
          <div className="p-6 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">خلاصه درخواست</h3>
            <div className="space-y-2">
              <div>
                <strong>نوع خدمات:</strong>{" "}
                {
                  serviceTypes.find((s) => s.id === formData.serviceTypeId)
                    ?.name
                }
              </div>
              <div>
                <strong>توضیحات:</strong> {formData.description}
              </div>
              <div>
                <strong>آدرس:</strong> {formData.address || "ثبت نشده"}
              </div>
            </div>
          </div>
        );
      case 4:
        // از تابع جدید handleAuthSuccess استفاده می‌کنیم
        return <AuthenticationStep2 onSuccess={handleAuthSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-2 max-w-2xl mx-auto">
      <RequestSteps currentStep={currentStep} onStepChange={setCurrentStep} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded my-4">
          {success}
        </div>
      )}

      <div className="my-6">{renderStepContent()}</div>

      {currentStep < 4 && !success && (
        <div className="flex justify-between my-4">
          {currentStep > 1 && (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={loading}
            >
              بازگشت
            </Button>
          )}
          {currentStep === 3 ? (
            <Button
              onClick={() =>
                session ? handleFinalSubmit() : setCurrentStep(4)
              }
              disabled={loading}
            >
              {loading ? "در حال ثبت..." : "تایید و ثبت نهایی"}
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              disabled={currentStep === 1 && !formData.serviceTypeId}
            >
              مرحله بعد
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

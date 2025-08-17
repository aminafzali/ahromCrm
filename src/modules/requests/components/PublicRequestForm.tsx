// مسیر فایل: src/modules/requests/components/PublicRequestForm.tsx
"use client";

import Loading from "@/@Client/Components/common/Loading";
import { ServiceType } from "@prisma/client";
import { Button, Input } from "ndui-ahrom";
import { useSession } from "next-auth/react";
import { useState } from "react";

// ایمپورت‌های داخلی که دیگر نیاز نداریم حذف شدند
// import { useRequest } from "../hooks/useRequest";

import { z } from "zod";
import { createRequestSchema } from "../validation/schema";
import AuthenticationStep2 from "./AuthenticationStep2";
import RequestSteps from "./RequestSteps";
import ServiceSelection from "./ServiceSelection";

// این props ها از صفحه اصلی (Server Component) پاس داده می‌شوند
interface PublicRequestFormProps {
//  serviceTypes: ServiceType[];
  initialStatusId: number;
}

type FormData = Partial<z.infer<typeof createRequestSchema>>;

export default function PublicRequestForm({
  //  serviceTypes,
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

  // توابع هندلر مراحل، بدون تغییر باقی می‌مانند
  const handleNextStep = () => {
    // ... (این بخش بدون تغییر است)
    if (currentStep === 2) {
      const validation = createRequestSchema
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

  // تابع ارسال نهایی که جایگزین منطق useRequest می‌شود
  const handleFinalSubmit = async (authData?: { phone: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // اگر کاربر لاگین بود، شماره تلفن را از session بگیر، در غیر این صورت از ورودی auth بگیر
    const finalAuthData =
      authData || (session ? { phone: session.user.phone } : null);

    if (!finalAuthData) {
      setError("امکان احراز هویت وجود ندارد. لطفا صفحه را رفرش کنید.");
      setLoading(false);
      return;
    }

    const finalRequestData = {
      ...formData,
      statusId: initialStatusId,
    };

    // اعتبارسنجی نهایی قبل از ارسال
    const validation = createRequestSchema.safeParse(finalRequestData);
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
      // **تغییر اصلی اینجاست**
      // به جای useRequest.create، مستقیم به API عمومی امن خودمان درخواست می‌زنیم
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

      setSuccess("درخواست شما با موفقیت ثبت شد!");
      // اگر کاربر لاگین نبود و تازه احراز هویت شده، session را آپدیت می‌کنیم
      if (!session) {
        await updateSession();
      }

      // کاربر را به پنل کاربری هدایت می‌کنیم
      window.location.href = "/panel/requests";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            onSelect={(serviceTypeId) =>
              setFormData((prev) => ({ ...prev, serviceTypeId }))
            }
            selectedService={formData.serviceTypeId}
            // serviceTypes از props می‌آید و دیگر خطایی وجود ندارد
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
          // ... (بخش خلاصه درخواست، بدون تغییر)
          <div className="p-6 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">خلاصه درخواست</h3>
            {/* محتوای خلاصه */}
          </div>
        );
      case 4:
        // **تغییر اصلی اینجاست**
        // پراپ onAuthSuccess به onSuccess تغییر کرد تا با کامپوننت شما هماهنگ باشد
        return <AuthenticationStep2 onSuccess={handleFinalSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-2 max-w-2xl mx-auto">
      <RequestSteps currentStep={currentStep} onStepChange={setCurrentStep} />

      {error && <div className="alert alert-danger my-4">{error}</div>}
      {success && <div className="alert alert-success my-4">{success}</div>}

      <div className="my-6">{renderStepContent()}</div>

      {currentStep < 4 && (
        <div className="flex justify-between my-4">
          {/* دکمه بازگشت */}
          {currentStep > 1 && (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              بازگشت
            </Button>
          )}
          {/* دکمه مرحله بعد یا ثبت نهایی */}
          {currentStep === 3 ? (
            // اگر لاگین بود، مستقیم ثبت کن. اگر نبود، منتظر مرحله احراز هویت بمان
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

// // مسیر فایل: src/modules/requests/components/PublicRequestForm.tsx

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import Loading from "@/@Client/Components/common/Loading";
// import { ServiceType } from "@prisma/client";
// import { Button, Form, Input } from "ndui-ahrom";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useRequest } from "../hooks/useRequest";
// import { createRequestSchema } from "../validation/schema";
// import AuthenticationStep from "./AuthenticationStep";
// import RequestSteps from "./RequestSteps"; // برای نمایش مراحل
// import ServiceSelection from "./ServiceSelection";

// interface PublicRequestFormProps {
//   workspaceId: number;
//   serviceTypes: ServiceType[];
//   initialStatusId: number;
// }

// export default function PublicRequestForm({
//   workspaceId,
//   serviceTypes,
//   initialStatusId,
// }: PublicRequestFormProps) {
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const {
//     create,
//     submitting: loading,
//     error,
//     success,
//     setError,
//   } = useRequest();

//   // در فرم عمومی، همیشه با مرحله انتخاب سرویس شروع می‌کنیم
//   const [currentStep, setCurrentStep] = useState(1);

//   // state برای نگهداری داده‌های فرم
//   const [formData, setFormData] = useState({
//     serviceTypeId: 0,
//     description: "",
//     address: "",
//     userId: parseInt(session?.user?.id || "0"),
//     statusId: initialStatusId,
//     workspaceId: workspaceId, // شناسه ورک‌اسپیس را از ابتدا در state قرار می‌دهیم
//   });

//   useEffect(() => {
//     // اگر کاربر لاگین کرد، userId را در state آپدیت می‌کنیم
//     if (session?.user) {
//       setFormData((prev) => ({ ...prev, userId: parseInt(session.user.id) }));
//     }
//   }, [session]);

//   if (status === "loading") return <Loading />;

//   // توابع هندلر دقیقاً مانند RequestForm
//   const handleNextStep = async () => {
//     if (currentStep === 2) {
//       const validation = createRequestSchema
//         .pick({ description: true })
//         .safeParse(formData);
//       if (!validation.success) {
//         setError(
//           validation.error.flatten().fieldErrors.description?.[0] ||
//             "خطا در اعتبارسنجی"
//         );
//         return;
//       }
//     }
//     setError(null);
//     setCurrentStep(currentStep + 1);
//   };

//   const handleServiceSelect = (serviceTypeId: number) => {
//     setFormData({ ...formData, serviceTypeId });
//   };

//   const handleSubmit = async (data: any) => {
//     try {
//       if (!session) {
//         sessionStorage.setItem("pendingRequest", JSON.stringify(data));
//         setCurrentStep(4); // نمایش مرحله احراز هویت
//         return;
//       }

//       // داده‌های نهایی را بر اساس اسکیمای کامل اعتبارسنجی می‌کنیم
//       const finalData = {
//         ...formData,
//         ...data,
//         userId: formData.userId, // اطمینان از وجود userId مشتری
//       };

//       const validation = createRequestSchema.safeParse(finalData);
//       if (!validation.success) {
//         // تبدیل خطاهای Zod به یک پیام قابل نمایش
//         const errorMessages = Object.values(
//           validation.error.flatten().fieldErrors
//         )
//           .flat()
//           .join("\n");
//         setError(errorMessages);
//         return;
//       }

//       const res: any = await create(validation.data);
//       router.push(`/panel/requests/${res?.id}`);
//     } catch (err) {
//       console.error("Error submitting request:", err);
//       // handleError از useCrud به صورت خودکار خطا را نمایش می‌دهد
//     }
//   };
//   const handleAuthenticationSuccess = async (userId: number) => {
//     try {
//       const storedData = sessionStorage.getItem("pendingRequest");
//       if (!storedData) return;

//       const requestData = {
//         ...JSON.parse(storedData),
//         userId, // شناسه کاربر جدید را اضافه می‌کنیم
//         serviceTypeId: formData.serviceTypeId,
//         statusId: formData.statusId,
//       };

//       const res: any = await create(requestData);
//       router.push(`/panel/requests/${res?.id}`);
//       sessionStorage.removeItem("pendingRequest");
//     } catch (error) {
//       console.error("Error submitting request after authentication:", error);
//     }
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <ServiceSelection
//             onSelect={handleServiceSelect}
//             selectedService={formData.serviceTypeId}
//           />
//         );
//       case 2:
//         return (
//           <Form
//             schema={createRequestSchema.pick({
//               description: true,
//               address: true,
//             })}
//             onSubmit={handleSubmit}
//             defaultValues={formData}
//           >
//             <div className="space-y-4">
//               <Input
//                 name="description"
//                 className="bg-white"
//                 label="توضیحات"
//                 placeholder="مشکل دستگاه یا جزئیات درخواست را شرح دهید"
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 required
//               />
//               <Input
//                 name="address"
//                 label="آدرس (اختیاری)"
//                 placeholder="آدرس دقیق خود را وارد کنید"
//                 value={formData.address}
//                 onChange={(e) =>
//                   setFormData({ ...formData, address: e.target.value })
//                 }
//               />
//             </div>
//           </Form>
//         );
//       case 3:
//         return (
//           <div className="p-6 bg-gray-100 rounded-lg">
//             <h3 className="text-xl font-bold mb-4">خلاصه درخواست</h3>
//             <div className="space-y-4">
//               <div>
//                 <strong>نوع خدمات:</strong>{" "}
//                 {serviceTypes.find((st) => st.id === formData.serviceTypeId)
//                   ?.name || "-"}
//               </div>
//               <div>
//                 <strong>توضیحات:</strong>
//                 <div className="mt-2">{formData.description}</div>
//               </div>
//               <div>
//                 <strong>آدرس:</strong> {formData.address || "ثبت نشده"}
//               </div>
//             </div>
//           </div>
//         );
//       case 4:
//         return <AuthenticationStep onSuccess={handleAuthenticationSuccess} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="p-2 max-w-2xl mx-auto">
//       <RequestSteps currentStep={currentStep} onStepChange={setCurrentStep} />

//       {error && <div className="alert alert-danger my-4">{error}</div>}
//       {success && <div className="alert alert-success my-4">{success}</div>}

//       <div className="my-6">{renderStepContent()}</div>

//       {currentStep < 4 && (
//         <div className="flex justify-between my-4">
//           {currentStep > 1 && (
//             <Button
//               variant="ghost"
//               onClick={() => setCurrentStep(currentStep - 1)}
//             >
//               <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
//               بازگشت
//             </Button>
//           )}
//           {currentStep === 3 ? (
//             <Button onClick={() => handleSubmit(formData)} disabled={loading}>
//               <DIcon icon="fa-check" cdi={false} classCustom="ml-2" />
//               {loading ? "در حال ثبت..." : "تایید و ثبت نهایی"}
//             </Button>
//           ) : (
//             <Button
//               onClick={handleNextStep}
//               disabled={currentStep === 1 && !formData.serviceTypeId}
//             >
//               مرحله بعد
//               <DIcon icon="fa-arrow-left" cdi={false} classCustom="mr-2" />
//             </Button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

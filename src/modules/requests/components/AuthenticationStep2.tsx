// // مسیر فایل: src/modules/requests/components/AuthenticationStep2.tsx

"use client";

import axios from "axios"; // استفاده از axios برای مدیریت بهتر خطاها
import { Button, Input } from "ndui-ahrom"; // فقط از کامپوننت‌های UI استفاده می‌کنیم
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";

interface AuthenticationStepProps {
  onSuccess: (authData: { phone: string }) => void;
  onBack: () => void;
}

export default function AuthenticationStep2({
  onSuccess,
  onBack,
}: AuthenticationStepProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/auth/send-otp", { phone });
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.error || "خطایی در ارسال کد رخ داد.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // مستقیماً signIn را با provider "credentials" صدا می‌زنیم
      const result = await signIn("credentials", {
        redirect: false,
        phone,
        otp,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success("شما با موفقیت وارد شدید.");
        onSuccess({ phone });
      }
    } catch (err: any) {
      setError(err.message || "کد تایید نامعتبر است یا خطایی رخ داده.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card bg-base-200 p-8">
      <h2 className="text-xl font-semibold mb-6 text-center">احراز هویت</h2>
      {error && <div className="alert alert-error mb-4">{error}</div>}

      {step === "phone" ? (
        <form onSubmit={handlePhoneSubmit}>
          <div className="space-y-4">
            <p className="text-sm text-center">
              برای ثبت درخواست، لطفاً شماره تماس خود را وارد کنید.
            </p>
            <Input
              name="phone"
              label="شماره تماس"
              placeholder="09123456789"
              type="tel"
              className="bg-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {loading ? "در حال ارسال..." : "دریافت کد تایید"}
            </Button>
            <Button variant="ghost" fullWidth onClick={onBack} type="button">
              بازگشت به فرم
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <div className="space-y-4">
            <p className="text-center mb-4">
              کد تایید به شماره {phone} ارسال شد.
            </p>
            <Input
              name="otp"
              label="کد تایید"
              placeholder="کد 6 رقمی"
              type="text"
              inputMode="numeric"
              className="bg-white"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {loading ? "در حال تایید..." : "تایید و ثبت نهایی"}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setStep("phone")}
              disabled={loading}
              type="button"
            >
              ویرایش شماره تماس
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
// // مسیر فایل: src/modules/requests/components/AuthenticationStep2.tsx

// import DIcon from "@/@Client/Components/common/DIcon";
// import { Button, Form, Input } from "ndui-ahrom";
// import { useState } from "react";
// import { z } from "zod";

// // ... (اسکیماها بدون تغییر باقی می‌مانند)
// const phoneSchema = z.object({
//   phone: z.string().min(11, "شماره تماس معتبر نیست"),
// });

// // Schema for OTP verification
// const otpSchema = z.object({
//   otp: z
//     .number()
//     .min(100000, "کد تایید باید 6 رقم باشد")
//     .max(999999, "کد تایید باید 6 رقم باشد"),
// });
// // **تغییر ۱: نوع پراپ onSuccess اصلاح می‌شود**
// interface AuthenticationStepProps {
//   onSuccess: (authData: { phone: string }) => void; // دیگر userId برنمی‌گرداند
// }

// export default function AuthenticationStep2({
//   onSuccess,
// }: AuthenticationStepProps) {
//   const [step, setStep] = useState<"phone" | "otp">("phone");
//   const [phone, setPhone] = useState("");
//   const [token, setToken] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handlePhoneSubmit = async (data: { phone: string }) => {
//     setLoading(true);
//     setError(null);
//     setPhone(data.phone);

//     try {
//       const response = await fetch("/api/auth/send-otp", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ phone: data.phone }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || "خطا در ارسال کد تایید");
//       }

//       setToken(result.token);
//       setStep("otp");
//     } catch (error) {
//       setError("خطا در ارسال کد تایید");
//       console.error("Send OTP error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpSubmit = async (data: { otp: number }) => {
//     setLoading(true);
//     setError(null);
//     const o: string = data.otp.toString();
//     try {
//       const response = await fetch("/api/auth/verify-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token, otp: o }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         setError(result.error || "کد تایید نامعتبر است");
//       } else {
//         // **تغییر ۲: به جای userId، شماره تلفن را پاس می‌دهیم**
//         // پس از تایید موفق OTP، فقط شماره تلفن را به والد اطلاع می‌دهیم.
//         onSuccess({ phone: phone });

//         // نیازی به signIn در اینجا نیست، چون فرم والد فرآیند را کامل می‌کند
//       }
//     } catch (error) {
//       setError("خطا در تایید کد");
//       console.error("کد ورود اشتباه است:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto">
//       <h2 className="text-xl font-semibold mb-6">احراز هویت</h2>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {step === "phone" ? (
//         <Form schema={phoneSchema} onSubmit={handlePhoneSubmit}>
//           <div className="space-y-4">
//             <Input
//               className="bg-white"
//               name="phone"
//               label="شماره تماس"
//               placeholder=""
//               type="tel"
//             />

//             <Button
//               type="submit"
//               fullWidth
//               disabled={loading}
//               icon={
//                 <DIcon icon="fa-paper-plane" cdi={false} classCustom="ml-2" />
//               }
//             >
//               {loading ? "در حال ارسال کد..." : "دریافت کد تایید"}
//             </Button>
//           </div>
//         </Form>
//       ) : (
//         <Form schema={otpSchema} onSubmit={handleOtpSubmit}>
//           <div className="space-y-4">
//             <p className="text-center mb-4">
//               کد تایید به شماره {phone} ارسال شد
//             </p>

//             <Input
//               name="otp"
//               className="bg-white"
//               label="کد تایید"
//               placeholder="کد 6 رقمی را وارد کنید"
//               type="number"
//             />

//             <Button
//               type="submit"
//               fullWidth
//               disabled={loading}
//               icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
//             >
//               {loading ? "در حال تایید..." : "تایید و ادامه"}
//             </Button>

//             <Button
//               variant="ghost"
//               fullWidth
//               onClick={() => setStep("phone")}
//               disabled={loading}
//               icon={
//                 <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
//               }
//             >
//               بازگشت
//             </Button>
//           </div>
//         </Form>
//       )}
//     </div>
//   );
// }

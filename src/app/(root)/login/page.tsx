"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import axios from "axios";
import { Button, Input } from "ndui-ahrom";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  // --- منطق کامپوننت (این بخش کاملاً دست‌نخورده باقی مانده است) ---
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/auth/send-otp", { phone });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || "خطایی در ارسال کد رخ داد.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      phone,
      otp,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      const callbackUrl = searchParams.get("callbackUrl") || "/workspaces";
      router.push(callbackUrl);
    }
  };

  // رنگ پایه (قابل تغییر)
  const tealColor = "#0d9488";

  // ----- UI (فقط طراحی؛ منطق بدون تغییر) -----
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border">
          {/* header */}
          <div
            className="px-8 py-6"
            style={{
              background:
                "linear-gradient(90deg, rgba(13,148,136,0.06), rgba(13,148,136,0.02))",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  ورود به حساب کاربری
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {step === 1
                    ? "برای شروع شماره موبایل خود را وارد نمایید."
                    : `کد تایید به شماره ${phone || "----"} ارسال گردید.`}
                </p>
              </div>
              <div
                aria-hidden
                className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/70 shadow-sm"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-teal-600"
                >
                  <path
                    d="M12 2L12 12"
                    stroke={tealColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 8L12 12L18 8"
                    stroke={tealColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* steps indicator */}
            <div className="mt-4 flex gap-2 items-center">
              <div
                className={`flex-1 p-2 rounded-md text-center text-sm font-medium ${
                  step === 1
                    ? "bg-teal-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                شماره موبایل
              </div>
              <div
                className={`flex-1 p-2 rounded-md text-center text-sm font-medium ${
                  step === 2
                    ? "bg-teal-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                وارد کردن کد
              </div>
            </div>
          </div>

          {/* body */}
          <div className="px-8 py-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} noValidate>
                <div className="space-y-4">
                  <Input
                    name="phone"
                    label="شماره موبایل"
                    placeholder="09123456789"
                    type="tel"
                    className="bg-white"
                    value={phone}
                    onChange={(e: any) => setPhone(e.target.value)}
                    required
                    autoFocus
                  />

                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={loading}
                      icon={
                        <DIcon
                          icon="fa-paper-plane"
                          cdi={false}
                          classCustom="ml-2"
                        />
                      }
                    >
                      {loading ? "در حال ارسال..." : "دریافت کد تایید"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      onClick={() => {
                        // فقط UI؛ هیچ منطق اضافی
                      }}
                    >
                      راهنمای ورود
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="space-y-4">
                  <div className="text-center text-sm text-gray-600">
                    کد ۶ رقمی را وارد کنید
                  </div>

                  <Input
                    name="otp"
                    label="کد تایید"
                    placeholder="• • • • • •"
                    type="text"
                    inputMode="numeric"
                    className="bg-white text-center"
                    value={otp}
                    onChange={(e: any) => setOtp(e.target.value)}
                    required
                    autoFocus
                    style={{ letterSpacing: "0.6rem" }}
                  />

                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={loading}
                      icon={
                        <DIcon icon="fa-check" cdi={false} classCustom="ml-2" />
                      }
                    >
                      {loading ? "در حال تایید..." : "تایید و ورود"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      onClick={() => {
                        setStep(1);
                        setError(null);
                      }}
                      disabled={loading}
                      icon={
                        <DIcon
                          icon="fa-arrow-right"
                          cdi={false}
                          classCustom="ml-2"
                        />
                      }
                    >
                      ویرایش شماره موبایل
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* footer */}
          <div className="px-8 py-4 bg-slate-50 text-center text-xs text-gray-500">
            <div>با ورود شما، قوانین و سیاست‌های حریم خصوصی را می‌پذیرید.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// // مسیر فایل: src/app/(root)/login/page.tsx (نسخه نهایی و کامل)

// "use client";

// import axios from "axios";
// import { signIn } from "next-auth/react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useState } from "react";

// export default function LoginPage() {
//   const [step, setStep] = useState(1);
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const handleSendOtp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       // استفاده از axios برای مدیریت بهتر خطاها
//       await axios.post("/api/auth/send-otp", { phone });
//       setStep(2);
//     } catch (err: any) {
//       // نمایش خطای سرور یا یک پیام عمومی
//       setError(err.response?.data?.error || "خطایی در ارسال کد رخ داد.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOtp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const result = await signIn("credentials", {
//       redirect: false,
//       phone,
//       otp,
//     });

//     setLoading(false);

//     if (result?.error) {
//       setError(result.error);
//     } else if (result?.ok) {
//       // پس از لاگین موفق، به صفحه انتخاب ورک‌اسپیس هدایت می‌شویم
//       const callbackUrl = searchParams.get("callbackUrl") || "/workspaces";
//       router.push(callbackUrl);
//     }
//   };

//   return (
//     <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
//       <div className="card shadow-sm" style={{ width: "25rem" }}>
//         <div className="card-body p-4">
//           <h3 className="card-title text-center mb-4">ورود | ثبت‌نام</h3>
//           {error && (
//             <div className="alert alert-danger p-2 text-center small">
//               {error}
//             </div>
//           )}

//           {step === 1 ? (
//             <form onSubmit={handleSendOtp}>
//               <div className="form-group">
//                 <label htmlFor="phone" className="form-label">
//                   شماره موبایل
//                 </label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   className="form-control form-control-lg text-center"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   placeholder="09123456789"
//                   required
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="btn btn-primary w-100 mt-3"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <span className="spinner-border spinner-border-sm"></span>
//                 ) : (
//                   "ارسال کد تایید"
//                 )}
//               </button>
//             </form>
//           ) : (
//             <form onSubmit={handleVerifyOtp}>
//               <div className="form-group text-center">
//                 <label htmlFor="otp" className="form-label">
//                   کد تایید ارسال شده را وارد کنید
//                 </label>
//                 <input
//                   type="text"
//                   id="otp"
//                   inputMode="numeric"
//                   className="form-control form-control-lg text-center"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="btn btn-link btn-sm mt-2"
//                   onClick={() => {
//                     setStep(1);
//                     setError(null);
//                   }}
//                 >
//                   ویرایش شماره موبایل
//                 </button>
//               </div>
//               <button
//                 type="submit"
//                 className="btn btn-success w-100 mt-3"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <span className="spinner-border spinner-border-sm"></span>
//                 ) : (
//                   "ورود به سیستم"
//                 )}
//               </button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

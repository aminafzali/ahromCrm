// مسیر فایل: src/app/(root)/login/page.tsx (نسخه نهایی و کامل)

"use client";

import axios from "axios";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
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
      // استفاده از axios برای مدیریت بهتر خطاها
      await axios.post("/api/auth/send-otp", { phone });
      setStep(2);
    } catch (err: any) {
      // نمایش خطای سرور یا یک پیام عمومی
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
      // پس از لاگین موفق، به صفحه انتخاب ورک‌اسپیس هدایت می‌شویم
      const callbackUrl =
        searchParams.get("callbackUrl") || "/select-workspace";
      router.push(callbackUrl);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: "25rem" }}>
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">ورود | ثبت‌نام</h3>
          {error && (
            <div className="alert alert-danger p-2 text-center small">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="form-control form-control-lg text-center"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 mt-3"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "ارسال کد تایید"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group text-center">
                <label htmlFor="otp" className="form-label">
                  کد تایید ارسال شده را وارد کنید
                </label>
                <input
                  type="text"
                  id="otp"
                  inputMode="numeric"
                  className="form-control form-control-lg text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-link btn-sm mt-2"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                  }}
                >
                  ویرایش شماره موبایل
                </button>
              </div>
              <button
                type="submit"
                className="btn btn-success w-100 mt-3"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "ورود به سیستم"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

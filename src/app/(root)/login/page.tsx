"use client";

import { Button, Form, Input } from "ndui-ahrom";
import { signIn } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

// Schema for phone number input
const phoneSchema = z.object({
  phone: z.string().min(11, "شماره تماس معتبر نیست"),
});

// Schema for OTP verification
const otpSchema = z.object({
  otp: z
    .number()
    .min(100000, "کد تایید باید 6 رقم باشد")
    .max(999999, "کد تایید باید 6 رقم باشد"),
});

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();
  const [callBack, setCallBack] = useState<string>("/");

  const pathname = usePathname(); // برای بازنشانی مقدار هنگام تغییر صفحه

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("callbackUrl"))
      setCallBack(params.get("callbackUrl") as string);
  }, [pathname]); // هنگام تغییر مسیر مقدار رو دوباره بگیره

  // Handle phone number submission
  const handlePhoneSubmit = async (data: { phone: string }) => {
    setLoading(true);
    setError(null);
    setPhone(data.phone);

    try {
      // Call API to send OTP
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: data.phone }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "خطا در ارسال کد تایید");
      } else {
        // Store token for OTP verification
        setToken(result.token);
        // Move to OTP verification step
        setStep("otp");
      }
    } catch (error) {
      setError("خطا در ارسال کد تایید");
      console.error("Send OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (data: { otp: number }) => {
    setLoading(true);
    setError(null);
    const o: string = data.otp.toString();
    try {
      // Verify OTP
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, otp: o }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "کد تایید نامعتبر است");
      } else {
        // Sign in with NextAuth using the verified token
        const signInResult = await signIn("credentials", {
          redirect: true,
          callbackUrl: callBack,
          phone,
          token: result.token,
        });

        if (signInResult?.error) {
          setError("خطا در ورود به سیستم");
        }
      }
    } catch (error) {
      setError("خطا در تایید کد");
      console.error("Verify OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call API to resend OTP
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "خطا در ارسال مجدد کد تایید");
      } else {
        // Update token
        setToken(result.token);
        // Show success message
        setError("کد تایید جدید ارسال شد");
      }
    } catch (error) {
      setError("خطا در ارسال مجدد کد تایید");
      console.error("Resend OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">ورود به سامانه</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {step === "phone" ? (
        <Form schema={phoneSchema} onSubmit={handlePhoneSubmit}>
          <div className="space-y-4">
            <Input
              name="phone"
              label="شماره تماس"
              placeholder="09123456789"
              type="tel"
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "در حال ارسال کد..." : "دریافت کد تایید"}
            </Button>
          </div>
        </Form>
      ) : (
        <Form schema={otpSchema} onSubmit={handleOtpSubmit}>
          <div className="space-y-4">
            <p className="text-center mb-4">
              کد تایید به شماره {phone} ارسال شد
            </p>

            <Input
              name="otp"
              label="کد تایید"
              placeholder="کد 6 رقمی را وارد کنید"
              type="number"
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "در حال تایید..." : "تایید و ورود"}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={handleResendOtp}
              disabled={loading}
            >
              ارسال مجدد کد
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => setStep("phone")}
              disabled={loading}
            >
              بازگشت
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}

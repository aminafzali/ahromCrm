import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Form, Input } from "ndui-ahrom";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { z } from "zod";

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
interface AuthenticationStepProps {
  onSuccess: (userId: number) => void;
}

export default function AuthenticationStep({
  onSuccess,
}: AuthenticationStepProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async (data: { phone: string }) => {
    setLoading(true);
    setError(null);
    setPhone(data.phone);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: data.phone }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در ارسال کد تایید");
      }

      setToken(result.token);
      setStep("otp");
    } catch (error) {
      setError("خطا در ارسال کد تایید");
      console.error("Send OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

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
          redirect: false,
          phone,
          token: result.token,
        });

        onSuccess(result.user.id);
        if (signInResult?.error) {
          setError("خطا در ورود به سیستم");
        } else {
          // router.push("/");
        }
      }
    } catch (error) {
      setError("خطا در تایید کد");
      console.error("کد ورود اشتباه است:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-6">احراز هویت</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {step === "phone" ? (
        <Form schema={phoneSchema} onSubmit={handlePhoneSubmit}>
          <div className="space-y-4">
            <Input
              className="bg-white"
              name="phone"
              label="شماره تماس"
              placeholder="09123456789"
              type="tel"
            />

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              icon={
                <DIcon icon="fa-paper-plane" cdi={false} classCustom="ml-2" />
              }
            >
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
              className="bg-white"
              label="کد تایید"
              placeholder="کد 6 رقمی را وارد کنید"
              type="number"
            />

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
            >
              {loading ? "در حال تایید..." : "تایید و ادامه"}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => setStep("phone")}
              disabled={loading}
              icon={
                <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
              }
            >
              بازگشت
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}

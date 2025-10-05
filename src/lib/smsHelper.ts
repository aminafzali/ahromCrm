import MelipayamakApi from "melipayamak";

const SMS_API_KEY = process.env.SMS_IR_API_KEY;
const SMS_LINE_NUMBER = process.env.SMS_IR_LINE_NUMBER;
const SMS_API_URL = "https://api.sms.ir/v1/send";

interface SmsResponse {
  status: number;
  message: string;
  data?: any;
}

export class SmsHelper {
  private static ensureMelipayamakEnv() {
    const username = process.env.MELIPAYAMAK_USERNAME as string;
    const password = process.env.MELIPAYAMAK_PASSWORD as string;
    const from = process.env.MELIPAYAMAK_LINE_NUMBER as string;
    if (!username || !password || !from) {
      throw new Error(
        "Melipayamak env vars missing (MELIPAYAMAK_USERNAME, MELIPAYAMAK_PASSWORD, MELIPAYAMAK_LINE_NUMBER)"
      );
    }
    return { username, password, from };
  }

  private static async getCredit(): Promise<{
    ok: boolean;
    credit?: number | string;
  }> {
    try {
      const { username, password } = this.ensureMelipayamakEnv();
      const api = new MelipayamakApi(username, password);
      // تلاش با REST
      try {
        const restSms = api.sms();
        const restCredit = await (restSms as any).getCredit?.();
        if (restCredit !== undefined) {
          console.log("[SMS] Melipayamak credit (REST):", restCredit);
          return { ok: true, credit: restCredit };
        }
      } catch (e) {
        // ادامه با SOAP
      }
      try {
        const soapSms = api.sms("soap");
        const soapCredit = await (soapSms as any).getCredit?.();
        console.log("[SMS] Melipayamak credit (SOAP):", soapCredit);
        return { ok: true, credit: soapCredit };
      } catch (e2) {
        console.error("[SMS] Melipayamak getCredit failed (SOAP)", e2);
      }
      return { ok: false };
    } catch (err) {
      console.error("[SMS] Melipayamak getCredit env/config error", err);
      return { ok: false };
    }
  }

  private static async sendOTP(
    receptor: string,
    code: any
  ): Promise<SmsResponse> {
    try {
      const response = await fetch("https://api.sms.ir/v1/send/verify", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SMS_IR_API_KEY as string, // در .env عمومی قرار دهید
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TemplateId: 644348,
          Mobile: receptor,
          parameters: [{ name: "VERIFICATIONCODE", value: code }],
        }),
      });

      return {
        status: response.status,
        message: "SMS sent successfully",
      };
    } catch (error: any) {
      return {
        status: error.response?.status || 500,
        message: error.message || "Failed to send SMS",
      };
    }
  }
  private static async sendSms(
    receptor: string,
    message: string
  ): Promise<SmsResponse> {
    try {
      const { username, password, from } = this.ensureMelipayamakEnv();
      const api = new MelipayamakApi(username, password);
      const sms = api.sms();

      // Melipayamak SDK: send(to, from, text)
      const providerResponse = await sms.send(receptor, from, message);

      // Log request/response for diagnostics (mask phone)
      console.log("[SMS] Melipayamak send response:", providerResponse, {
        to: receptor?.replace(/(\d{4})\d+(\d{3})/, "$1***$2"),
        from,
        len: message?.length,
      });

      // Interpret response (supports both plain RecId and object with RetStatus)
      let ok = false;
      if (providerResponse && typeof providerResponse === "object") {
        const ret = (providerResponse as any).RetStatus;
        const str = (providerResponse as any).StrRetStatus;
        ok = ret === 1 || str === "Ok";
      } else {
        const recId = Number(providerResponse);
        ok = !Number.isNaN(recId) && recId > 0;
      }

      // Fetch and log current credit after send attempt
      const credit = await this.getCredit();
      if (credit.ok) {
        console.log("[SMS] Current credit:", credit.credit);
      }

      return {
        status: ok ? 200 : 502,
        message: ok ? "SMS sent successfully" : "SMS provider returned error",
        data: providerResponse,
      };
    } catch (error: any) {
      console.error("[SMS] Melipayamak send error:", error);
      // Even on error, attempt to log credit to aid diagnostics
      const credit = await this.getCredit();
      if (credit.ok) {
        console.log("[SMS] Current credit:", credit.credit);
      }
      return {
        status: error?.response?.status || 500,
        message: error?.message || "Failed to send SMS",
      };
    }
  }

  /**
   * Send OTP code via SMS
   */
  public static async send(phone: string, code: string): Promise<SmsResponse> {
    return this.sendOTP(phone, code);
  }

  /**
   * Send notification via SMS
   */
  public static async sendNotification(
    phone: string,
    title: string,
    message: string
  ): Promise<SmsResponse> {
    const smsMessage = `${title}\n${message}\n\nلغو11`;
    return this.sendSms(phone, smsMessage);
  }

  /**
   * Send SMS with custom text
   */
  public static async sendSmsText(
    phone: string,
    text: string
  ): Promise<SmsResponse> {
    return this.sendSms(phone, text);
  }
}

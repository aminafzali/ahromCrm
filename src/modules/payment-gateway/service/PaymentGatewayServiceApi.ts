import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { PaymentGatewayProvider } from "@prisma/client";
import { connects, relations, searchFileds } from "../data/fetch";
import {
  createGatewayConfigSchema,
  updateGatewayConfigSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("PaymentGatewayConfig");
  }
}

export class PaymentGatewayServiceApi extends BaseService<any> {
  constructor() {
    const repository = new Repository();
    super(
      repository,
      createGatewayConfigSchema,
      updateGatewayConfigSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = repository;
  }

  /**
   * دریافت درگاه پیش‌فرض برای پرداخت آنلاین
   */
  async getDefaultGateway(workspaceId: number): Promise<any> {
    return prisma.paymentGatewayConfig.findFirst({
      where: {
        workspaceId,
        isActive: true,
        defaultForOnlinePayments: true,
      },
    });
  }

  /**
   * ایجاد درخواست پرداخت آنلاین و تولید URL درگاه
   */
  async createGatewayRequest(params: {
    workspaceId: number;
    orderId?: number;
    invoiceId?: number;
    amount: number;
    callbackUrl?: string;
  }): Promise<{ url: string; refId: string }> {
    const { workspaceId, orderId, invoiceId, amount, callbackUrl } = params;

    const gateway = await this.getDefaultGateway(workspaceId);
    if (!gateway) {
      throw new Error("No active payment gateway configured");
    }

    // ایجاد رکورد Payment با status PENDING
    const payment = await prisma.payment.create({
      data: {
        workspaceId,
        workspaceUserId: 0, // باید از context بیاید
        invoiceId: invoiceId || undefined,
        amount,
        method: "ONLINE_GATEWAY",
        type: "RECEIVE",
        status: "PENDING",
        description: `پرداخت آنلاین - سفارش ${orderId || invoiceId}`,
      },
    });

    // تولید URL درگاه بر اساس provider
    const refId = `PAY-${payment.id}-${Date.now()}`;
    const url = await this.generateGatewayUrl(gateway, {
      amount,
      refId,
      callbackUrl:
        callbackUrl ||
        `${process.env.NEXTAUTH_URL}/api/payment/callback/${gateway.provider}`,
      paymentId: payment.id,
    });

    // ذخیره refId در payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayRefId: refId,
      },
    });

    return { url, refId };
  }

  /**
   * تولید URL درگاه بر اساس provider
   */
  private async generateGatewayUrl(
    gateway: any,
    params: {
      amount: number;
      refId: string;
      callbackUrl: string;
      paymentId: number;
    }
  ): Promise<string> {
    const config = gateway.config as any;

    switch (gateway.provider) {
      case PaymentGatewayProvider.ZARINPAL:
        // TODO: اتصال به Zarinpal API
        return `https://www.zarinpal.com/pg/StartPay/${params.refId}`;

      case PaymentGatewayProvider.IDPAY:
        // TODO: اتصال به IDPay API
        return `https://idpay.ir/p/${params.refId}`;

      case PaymentGatewayProvider.SADAD:
        // TODO: اتصال به Sadad API
        return `https://sadad.shaparak.ir/payment/${params.refId}`;

      case PaymentGatewayProvider.NEXTPAY:
        // TODO: اتصال به NextPay API
        return `https://nextpay.ir/payment/${params.refId}`;

      default:
        throw new Error(`Unsupported gateway provider: ${gateway.provider}`);
    }
  }

  /**
   * هندل کردن callback از درگاه
   */
  async handleGatewayCallback(
    provider: PaymentGatewayProvider,
    payload: any
  ): Promise<{ success: boolean; paymentId: number; message?: string }> {
    // پیدا کردن payment بر اساس refId یا tracking code
    const refId = payload.refId || payload.Authority || payload.Token;
    const payment = await prisma.payment.findFirst({
      where: {
        gatewayRefId: refId,
      },
      include: {
        invoice: true,
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // بررسی وضعیت پرداخت از درگاه
    const isSuccess = await this.verifyPayment(provider, payload);

    if (isSuccess) {
      // به‌روزرسانی payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          paidAt: new Date(),
          gatewayTrackingCode: payload.trackingCode || payload.RefNum,
          rawGatewayResponse: payload,
        },
      });

      // به‌روزرسانی وضعیت فاکتور (اگر متصل باشد)
      if (payment.invoiceId) {
        // این کار توسط PaymentServiceApi.handleAfterCreate انجام می‌شود
      }

      return {
        success: true,
        paymentId: payment.id,
        message: "پرداخت با موفقیت انجام شد",
      };
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          rawGatewayResponse: payload,
        },
      });

      return {
        success: false,
        paymentId: payment.id,
        message: "پرداخت ناموفق بود",
      };
    }
  }

  /**
   * تایید پرداخت از درگاه
   */
  private async verifyPayment(
    provider: PaymentGatewayProvider,
    payload: any
  ): Promise<boolean> {
    // TODO: پیاده‌سازی تایید واقعی از API درگاه
    // فعلاً یک mock ساده
    return (
      payload.status === "OK" ||
      payload.Status === "OK" ||
      payload.statusCode === 100
    );
  }
}

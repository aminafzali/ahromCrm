import { PaymentGatewayProvider } from "@prisma/client";
import { z } from "zod";

export const createGatewayConfigSchema = z.object({
  provider: z.nativeEnum(PaymentGatewayProvider, {
    required_error: "انتخاب درگاه پرداخت الزامی است.",
  }),
  isActive: z.boolean().default(false),
  config: z.record(z.any()), // merchantId, terminalId, apiKey, etc.
  callbackUrl: z.string().url().optional(),
  defaultForOnlinePayments: z.boolean().default(false),
});

export const updateGatewayConfigSchema = z.object({
  provider: z.nativeEnum(PaymentGatewayProvider).optional(),
  isActive: z.boolean().optional(),
  config: z.record(z.any()).optional(),
  callbackUrl: z.string().url().optional(),
  defaultForOnlinePayments: z.boolean().optional(),
});

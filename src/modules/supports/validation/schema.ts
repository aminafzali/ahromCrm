import { z } from "zod";

export const supportSourceEnum = z.enum([
  "INBOUND_CALL",
  "OUTBOUND_CALL",
  "USER_TICKET",
  "ADMIN_TICKET",
  "ONSITE_BY_USER",
  "ONSITE_BY_US",
]);

export const supportTypeEnum = z.enum([
  "SALES_ORDER",
  "QUOTE",
  "ORDER_FOLLOWUP",
  "PURCHASE_ORDER",
  "PURCHASE_QUOTE",
  "COMPLAINT",
  "ISSUE",
  "QUESTION",
]);

export const supportPriorityEnum = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const createSupportsSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  description: z.string().optional(),
  source: supportSourceEnum,
  type: supportTypeEnum,
  priority: supportPriorityEnum.default("MEDIUM"),
  status: z.string().min(1, "وضعیت الزامی است"),
  contactAt: z.date().optional().nullable(),
  dueAt: z.date().optional().nullable(),
  visibleToUser: z.boolean().default(true).optional(),

  user: z.object({ id: z.coerce.number() }).optional(),
  assignedAdmin: z.object({ id: z.coerce.number() }).optional(),
  assignedTeam: z.object({ id: z.coerce.number() }).optional(),
  category: z.object({ id: z.coerce.number() }).optional(),
  labels: z.array(z.object({ id: z.number() })).optional(),
});

export const updateSupportsSchema = createSupportsSchema.partial();

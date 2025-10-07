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

const dateOptional = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  // Accept StandaloneDatePicker payloads like { iso: string }
  const raw =
    typeof value === "object" && value && (value as any).iso
      ? (value as any).iso
      : (value as any);
  const date = new Date(raw);
  return isNaN(date.getTime()) ? undefined : date;
}, z.date().optional());

const toIdObjectOptional = (schema: any) =>
  z.preprocess((value) => {
    if (value === null || value === undefined || value === "") return undefined;
    // number or string id
    if (typeof value === "number" || typeof value === "string") {
      const n = Number(value);
      return Number.isFinite(n) ? { id: n } : undefined;
    }
    // Select3 option object { value, label }
    if (typeof value === "object" && (value as any).value !== undefined) {
      const n = Number((value as any).value);
      return Number.isFinite(n) ? { id: n } : undefined;
    }
    // Object with id field (string or number)
    if (typeof value === "object" && (value as any).id !== undefined) {
      const n = Number((value as any).id);
      return Number.isFinite(n) ? { id: n } : undefined;
    }
    return undefined;
  }, schema.optional());

const toIdObjectArrayOptional = (schema: any) =>
  z.preprocess((value) => {
    if (!Array.isArray(value)) return undefined;
    const normalized = value
      .map((v) => {
        if (v === null || v === undefined || v === "") return undefined;
        if (typeof v === "number" || typeof v === "string") {
          const n = Number(v);
          return Number.isFinite(n) ? { id: n } : undefined;
        }
        if (typeof v === "object") {
          if ((v as any).value !== undefined) {
            const n = Number((v as any).value);
            return Number.isFinite(n) ? { id: n } : undefined;
          }
          if ((v as any).id !== undefined) {
            const n = Number((v as any).id);
            return Number.isFinite(n) ? { id: n } : undefined;
          }
        }
        return undefined;
      })
      .filter(Boolean);
    return normalized.length ? normalized : undefined;
  }, schema.optional());

export const createSupportsSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  description: z.string().optional(),
  source: supportSourceEnum,
  type: supportTypeEnum,
  priority: supportPriorityEnum.default("MEDIUM"),
  status: z.string().min(1, "وضعیت الزامی است"),
  contactAt: dateOptional,
  dueAt: dateOptional,
  visibleToUser: z.boolean().default(true).optional(),

  // All relations are optional
  user: toIdObjectOptional(z.object({ id: z.coerce.number() })),
  assignedAdmin: toIdObjectOptional(z.object({ id: z.coerce.number() })),
  assignedTeam: toIdObjectOptional(z.object({ id: z.coerce.number() })),
  category: toIdObjectOptional(z.object({ id: z.coerce.number() })),
  labels: toIdObjectArrayOptional(z.array(z.object({ id: z.number() }))),
  tasks: toIdObjectArrayOptional(z.array(z.object({ id: z.number() }))),
  documents: toIdObjectArrayOptional(z.array(z.object({ id: z.number() }))),
  knowledge: toIdObjectArrayOptional(z.array(z.object({ id: z.number() }))),
});

export const updateSupportsSchema = createSupportsSchema.partial();

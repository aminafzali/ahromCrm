import { z } from "zod";

export const ticketStatusEnum = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "PENDING",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
]);

export const ticketPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

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

export const createTicketSchema = z.object({
  subject: z.string().min(1, "موضوع الزامی است"),
  description: z.string().optional(),
  status: ticketStatusEnum.default("OPEN"),
  priority: ticketPriorityEnum.default("MEDIUM"),

  // All relations are optional
  workspaceUser: toIdObjectOptional(z.object({ id: z.coerce.number() })),
  guestUser: toIdObjectOptional(z.object({ id: z.coerce.number() })),
  assignedTo: toIdObjectOptional(z.object({ id: z.coerce.number() })),
  category: toIdObjectOptional(z.object({ id: z.coerce.number() })),
  labels: toIdObjectArrayOptional(z.array(z.object({ id: z.number() }))),
});

export const updateTicketSchema = createTicketSchema.partial();

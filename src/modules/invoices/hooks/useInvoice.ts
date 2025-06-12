import { useCrud } from "@/@Client/hooks/useCrud";
import { InvoiceRepository } from "../repo/InvoiceRepository";
import { InvoiceWithRelations } from "../types";
import { z } from "zod";
import { createInvoiceSchema } from "../validation/schema";

export function useInvoice() {
  const invoiceRepo = new InvoiceRepository();
  const hook = useCrud<
    InvoiceWithRelations,
    z.infer<typeof createInvoiceSchema>,
    z.infer<typeof createInvoiceSchema>
  >(invoiceRepo);

  return {
    ...hook,
  };
}
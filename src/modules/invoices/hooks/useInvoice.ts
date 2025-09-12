import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { InvoiceRepository } from "../repo/InvoiceRepository";
import { InvoiceWithRelations } from "../types";
import { createInvoiceSchema } from "../validation/schema";

export function useInvoice() {
  const invoiceRepo = new InvoiceRepository();
  const hook = useCrud<
    InvoiceWithRelations,
    z.infer<typeof createInvoiceSchema>,
    z.infer<typeof createInvoiceSchema>
  >(invoiceRepo);

  /**
   * Fetches the next invoice number using the repository instance.
   */
  const fetchNextInvoiceNumber = async () => {
    try {
      const data = await invoiceRepo.getNextInvoiceNumber();
      return data.invoiceNumber;
    } catch (error) {
      console.error("Failed to fetch next invoice number", error);
      return 1; // Fallback value
    }
  };

  return {
    ...hook,
    fetchNextInvoiceNumber,
  };
}

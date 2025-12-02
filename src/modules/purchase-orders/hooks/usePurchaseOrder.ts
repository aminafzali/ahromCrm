import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { PurchaseOrderRepository } from "../repo/PurchaseOrderRepository";
import { PurchaseOrderWithRelations } from "../types";
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
} from "../validation/schema";

export function usePurchaseOrder() {
  const repo = new PurchaseOrderRepository();
  const hook = useCrud<
    PurchaseOrderWithRelations,
    z.infer<typeof createPurchaseOrderSchema>,
    z.infer<typeof updatePurchaseOrderSchema>
  >(repo);

  /**
   * تایید سفارش خرید
   */
  const approve = async (id: number) => {
    try {
      const result = await repo.approve(id);
      return result;
    } catch (error) {
      console.error("Failed to approve purchase order:", error);
      throw error;
    }
  };

  /**
   * تایید دریافت کالا
   */
  const receive = async (id: number) => {
    try {
      const result = await repo.receive(id);
      return result;
    } catch (error) {
      console.error("Failed to receive purchase order:", error);
      throw error;
    }
  };

  /**
   * لغو سفارش خرید
   */
  const cancel = async (id: number) => {
    try {
      const result = await repo.cancel(id);
      return result;
    } catch (error) {
      console.error("Failed to cancel purchase order:", error);
      throw error;
    }
  };

  /**
   * تبدیل به فاکتور
   */
  const convertToInvoice = async (id: number) => {
    try {
      const result = await repo.convertToInvoice(id);
      return result;
    } catch (error) {
      console.error("Failed to convert purchase order to invoice:", error);
      throw error;
    }
  };

  return {
    ...hook,
    approve,
    receive,
    cancel,
    convertToInvoice,
  };
}

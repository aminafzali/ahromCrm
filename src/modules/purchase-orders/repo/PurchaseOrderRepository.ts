import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { PurchaseOrderWithRelations } from "../types";

export class PurchaseOrderRepository extends BaseRepository<
  PurchaseOrderWithRelations,
  number
> {
  constructor() {
    super("purchase-orders");
  }

  /**
   * تایید سفارش خرید
   */
  public async approve(id: number): Promise<PurchaseOrderWithRelations> {
    return await this.post<PurchaseOrderWithRelations>(
      `purchase-orders/${id}/approve`,
      {}
    );
  }

  /**
   * تایید دریافت کالا
   */
  public async receive(id: number): Promise<PurchaseOrderWithRelations> {
    return await this.post<PurchaseOrderWithRelations>(
      `purchase-orders/${id}/receive`,
      {}
    );
  }

  /**
   * لغو سفارش خرید
   */
  public async cancel(id: number): Promise<PurchaseOrderWithRelations> {
    return await this.post<PurchaseOrderWithRelations>(
      `purchase-orders/${id}/cancel`,
      {}
    );
  }

  /**
   * تبدیل به فاکتور
   */
  public async convertToInvoice(id: number): Promise<any> {
    return await this.post<any>(`purchase-orders/${id}/convert-to-invoice`, {});
  }
}

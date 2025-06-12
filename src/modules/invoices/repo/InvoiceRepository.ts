import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { InvoiceWithRelations } from "../types";

export class InvoiceRepository extends BaseRepository<InvoiceWithRelations, number> {
  constructor() {
    super("invoices");
  }
}
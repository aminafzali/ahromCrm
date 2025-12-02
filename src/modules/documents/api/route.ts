import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { DocumentServiceApi } from "../service/DocumentServiceApi";

const service = new DocumentServiceApi();
class Controller extends BaseController<any> {
  constructor() {
    super(service, include);
  }

  protected transformFilters(params: any): any {
    try {
      // اگر filters به صورت رشته ارسال شده باشد، parse می‌کنیم
      if (typeof params.filters === "string") {
        params.filters = JSON.parse(params.filters as unknown as string);
      }

      const filters = params.filters;

      if (
        filters &&
        typeof filters === "object" &&
        "filters" in filters &&
        filters.filters !== undefined
      ) {
        const nestedFilters = filters.filters;

        if (typeof nestedFilters === "string") {
          Object.assign(
            filters,
            JSON.parse(nestedFilters as unknown as string)
          );
        } else if (
          nestedFilters &&
          typeof nestedFilters === "object" &&
          !Array.isArray(nestedFilters)
        ) {
          Object.assign(filters, nestedFilters);
        }

        delete filters.filters;
      }
    } catch (error) {
      console.error("[DocumentsController] Failed to normalize filters", error);
    }

    return params;
  }
}
const controller = new Controller();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}

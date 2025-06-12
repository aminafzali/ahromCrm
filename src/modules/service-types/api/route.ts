import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest, NextResponse } from "next/server";
import { include } from "../data/fetch";
import { ServiceTypeServiceApi } from "../service/ServiceTypeServiceApi";

const service = new ServiceTypeServiceApi();

class ServiceTypeController extends BaseController<any> {
  constructor() {
    super(service, include);
  }

  async getAll(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      // await AuthProvider.isAuthenticated(req);
      const params = this.parseQueryParams(req);

      // Apply date range filter if provided
      if (params.dateRange.startDate || params.dateRange.endDate) {
        params.filters.createdAt = {};
        if (params.dateRange.startDate) {
          params.filters.createdAt.gte = new Date(params.dateRange.startDate);
        }
        if (params.dateRange.endDate) {
          params.filters.createdAt.lte = new Date(params.dateRange.endDate);
        }
      }

      const data = await this.service.getAll(params);
      return this.success(data);
    });
  }
}

const controller = new ServiceTypeController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { CommentServiceApi } from "../service/CommentServiceApi";

const service = new CommentServiceApi();
class Controller extends BaseController<any> {
  constructor() {
    super(service, include);
  }

  protected transformFilters(params: any): any {
    console.log(
      "🔍 [CommentsController] transformFilters called with params:",
      JSON.stringify(params, null, 2)
    );

    // Parse filters if it's a string (JSON)
    if (typeof params.filters === "string") {
      try {
        params.filters = JSON.parse(params.filters);
        console.log(
          "✅ [CommentsController] Parsed filters from string:",
          params.filters
        );
      } catch (e) {
        console.error(
          "❌ [CommentsController] Failed to parse filters string:",
          e
        );
        params.filters = {};
      }
    }

    // Ensure filters is an object
    if (!params.filters || typeof params.filters !== "object") {
      console.warn(
        "⚠️ [CommentsController] filters is not an object, setting to {}"
      );
      params.filters = {};
    }

    // Extract nested filters object if exists
    if (params.filters.filters && typeof params.filters.filters === "object") {
      // If filters has nested filters object, merge it
      params.filters = { ...params.filters, ...params.filters.filters };
      delete params.filters.filters;
      console.log(
        "✅ [CommentsController] Merged nested filters:",
        params.filters
      );
    }

    // Convert relation IDs to numbers (new format)
    const relationKeys = ["taskId", "knowledgeId", "documentId", "projectId"];
    relationKeys.forEach((key) => {
      if (
        params.filters[key] !== undefined &&
        params.filters[key] !== null &&
        params.filters[key] !== ""
      ) {
        params.filters[key] = Number(params.filters[key]);
        console.log(
          `✅ [CommentsController] Converted ${key} to number:`,
          params.filters[key]
        );
      }
    });

    // Backward compatibility: convert entityType/entityId
    if (
      params.filters.entityId !== undefined &&
      params.filters.entityId !== null &&
      params.filters.entityId !== ""
    ) {
      params.filters.entityId = Number(params.filters.entityId);
    }

    console.log(
      "✅ [CommentsController] Final filters:",
      JSON.stringify(params.filters, null, 2)
    );
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

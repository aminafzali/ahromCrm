// API endpoint برای مدیریت workflow ها
import { ApiResponse } from "@/@Server/Http/Response/ApiResponse";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { WorkflowDefinition } from "@/modules/chatbot/types/workflow";
import { NextRequest } from "next/server";

// ذخیره‌سازی workflow ها در حافظه (در آینده می‌توان به دیتابیس منتقل کرد)
const workflows: Map<string, WorkflowDefinition> = new Map();

export async function GET(req: NextRequest) {
  try {
    await AuthProvider.isAuthenticated(req, true, true);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const workflow = workflows.get(id);
      if (!workflow) {
        return ApiResponse.notFound("Workflow پیدا نشد");
      }
      return ApiResponse.success(workflow);
    }

    // لیست همه workflow ها
    const workflowList = Array.from(workflows.values());
    return ApiResponse.success(workflowList);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "امکان دریافت workflow نیست.";
    return ApiResponse.internalServerError(message, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await AuthProvider.isAuthenticated(req, true, true);
    const body = await req.json();

    if (!body.name || !body.steps || !Array.isArray(body.steps)) {
      return ApiResponse.badRequest("نام و steps workflow الزامی است");
    }

    const workflow: WorkflowDefinition = {
      id: body.id || `workflow-${Date.now()}`,
      name: body.name,
      description: body.description,
      steps: body.steps,
      startStepId: body.startStepId || body.steps[0]?.id,
      variables: body.variables || {},
    };

    workflows.set(workflow.id, workflow);

    return ApiResponse.success(workflow);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "امکان ایجاد workflow نیست.";
    return ApiResponse.internalServerError(message, error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await AuthProvider.isAuthenticated(req, true, true);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return ApiResponse.badRequest("شناسه workflow الزامی است");
    }

    const deleted = workflows.delete(id);
    if (!deleted) {
      return ApiResponse.notFound("Workflow پیدا نشد");
    }

    return ApiResponse.success({ deleted: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "امکان حذف workflow نیست.";
    return ApiResponse.internalServerError(message, error);
  }
}

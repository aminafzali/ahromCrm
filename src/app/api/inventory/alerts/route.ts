import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { InventoryAlertService } from "@/modules/inventory/service/InventoryAlertService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "inventory.view");

    const workspaceId = context.workspaceId;
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const alertService = new InventoryAlertService();
    const alerts = await alertService.getLowStockAlerts(workspaceId);

    return NextResponse.json({ data: alerts });
  } catch (error: any) {
    console.error("Inventory Alerts GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "inventory.manage");

    const workspaceId = context.workspaceId;
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const alertService = new InventoryAlertService();
    await alertService.sendLowStockAlerts(workspaceId);

    return NextResponse.json({ success: true, message: "Alerts sent" });
  } catch (error: any) {
    console.error("Inventory Alerts POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}


import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // استخراج فیلترها
    const filters: any = {};

    // فیلتر وضعیت
    const status = searchParams.get("status");
    if (status && status !== "all") {
      filters.status = status;
    }

    // فیلتر شماره اعلان
    const notificationNumber = searchParams.get("notificationNumber");
    if (notificationNumber) {
      filters.notificationNumber = notificationNumber;
    }

    // فیلتر جستجو
    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }

    // فیلتر workspaceId
    const workspaceId = searchParams.get("workspaceId");
    if (workspaceId) {
      filters.workspaceId = parseInt(workspaceId);
    }

    const notificationService = new NotificationServiceApi();
    const result = await notificationService.getGroupedNotifications({
      page,
      limit,
      filters,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in grouped notifications API:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت گروه‌های اعلان" },
      { status: 500 }
    );
  }
}

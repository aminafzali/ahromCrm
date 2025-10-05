import { ReminderServiceApi } from "@/modules/reminders/service/ReminderServiceApi";
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

    // فیلتر شماره یادآور
    const reminderNumber = searchParams.get("reminderNumber");
    if (reminderNumber) {
      filters.reminderNumber = reminderNumber;
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

    const reminderService = new ReminderServiceApi();
    const result = await reminderService.getGroupedReminders({
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
    console.error("Error in grouped reminders API:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت گروه‌های یادآور" },
      { status: 500 }
    );
  }
}

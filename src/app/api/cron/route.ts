import { NextResponse } from "next/server";
import { reminderCron } from "@/@Server/cron/reminderCron";

// Start the cron job
reminderCron.start();

export async function GET() {
  return NextResponse.json({ status: "Cron job is running" });
}
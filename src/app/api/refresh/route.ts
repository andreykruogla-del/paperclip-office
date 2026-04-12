import { NextResponse } from "next/server";
import { importAllLogs } from "@/server/import-logs";

// In-flight guard — prevent overlapping imports
let refreshing = false;

export async function POST() {
  if (refreshing) {
    return NextResponse.json({
      success: false,
      error: "Refresh already in progress",
    }, { status: 409 });
  }

  try {
    refreshing = true;
    const result = importAllLogs();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      timestamp: Date.now(),
    }, { status: 500 });
  } finally {
    refreshing = false;
  }
}

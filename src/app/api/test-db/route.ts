import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Test API: Attempting to connect to DB...");
    const userCount = await prisma.user.count();
    console.log("Test API: DB connection successful, user count:", userCount);
    return NextResponse.json({ status: "ok", count: userCount });
  } catch (error: any) {
    console.error("Test API: DB connection failed:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

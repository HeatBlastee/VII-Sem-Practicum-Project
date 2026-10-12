import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { REMINDER_TYPES } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const elderId = request.nextUrl.searchParams.get("elderId");
  const reminders = await prisma.reminder.findMany({
    where: elderId ? { elderId } : undefined,
    orderBy: { time: "asc" },
  });
  return NextResponse.json({ reminders });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { elderId, type, label, time, question, daysOfWeek } = body ?? {};

  if (!elderId || !label || !time || !question) {
    return NextResponse.json(
      { error: "elderId, label, time, and question are required" },
      { status: 400 }
    );
  }
  if (type && !REMINDER_TYPES.includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return NextResponse.json({ error: "time must be HH:mm" }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      elderId,
      type: type || "CUSTOM",
      label,
      time,
      question,
      daysOfWeek: daysOfWeek || "1,2,3,4,5,6,7",
    },
  });

  return NextResponse.json({ reminder }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// GET /api/mobile/today?elderId=xxx
// Returns the elder's active reminders for today, each paired with today's CheckIn
// (created on the fly if it doesn't exist yet), so the mobile app has one id to PATCH.
export async function GET(request: NextRequest) {
  const elderId = request.nextUrl.searchParams.get("elderId");
  if (!elderId) return NextResponse.json({ error: "elderId is required" }, { status: 400 });

  const elder = await prisma.elder.findUnique({ where: { id: elderId } });
  if (!elder) return NextResponse.json({ error: "elder not found" }, { status: 404 });

  const today = startOfDay(new Date());
  const isoWeekday = ((today.getDay() + 6) % 7) + 1; // Mon=1..Sun=7

  const reminders = await prisma.reminder.findMany({
    where: { elderId, active: true },
    orderBy: { time: "asc" },
  });

  const todaysReminders = reminders.filter((r) =>
    r.daysOfWeek.split(",").map(Number).includes(isoWeekday)
  );

  const items = await Promise.all(
    todaysReminders.map(async (reminder) => {
      let checkIn = await prisma.checkIn.findFirst({
        where: { reminderId: reminder.id, scheduledFor: { gte: today } },
      });
      if (!checkIn) {
        checkIn = await prisma.checkIn.create({
          data: { elderId, reminderId: reminder.id, scheduledFor: new Date(), status: "PENDING" },
        });
      }
      return { reminder, checkIn };
    })
  );

  return NextResponse.json({ elder, items });
}

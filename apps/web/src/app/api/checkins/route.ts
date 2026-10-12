import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/checkins?elderId=xxx&days=7
export async function GET(request: NextRequest) {
  const elderId = request.nextUrl.searchParams.get("elderId");
  const days = Number(request.nextUrl.searchParams.get("days") || "7");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const checkIns = await prisma.checkIn.findMany({
    where: {
      ...(elderId ? { elderId } : {}),
      scheduledFor: { gte: since },
    },
    include: { reminder: true, elder: true },
    orderBy: { scheduledFor: "desc" },
  });

  return NextResponse.json({ checkIns });
}

// POST /api/checkins  (mobile app creates a check-in instance when a notification fires)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { elderId, reminderId, scheduledFor } = body ?? {};

  if (!elderId || !reminderId) {
    return NextResponse.json({ error: "elderId and reminderId are required" }, { status: 400 });
  }

  const checkIn = await prisma.checkIn.create({
    data: {
      elderId,
      reminderId,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      status: "PENDING",
    },
  });

  return NextResponse.json({ checkIn }, { status: 201 });
}

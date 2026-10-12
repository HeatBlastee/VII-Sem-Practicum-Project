import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CHECKIN_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

// PATCH /api/checkins/[id]  — elder answers the notification from the mobile app
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, response, note } = body ?? {};

  if (status && !CHECKIN_STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const checkIn = await prisma.checkIn.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(response !== undefined ? { response } : {}),
      ...(note !== undefined ? { note } : {}),
      respondedAt: new Date(),
    },
  });

  return NextResponse.json({ checkIn });
}

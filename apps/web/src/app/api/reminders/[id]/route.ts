import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { label, time, question, active, daysOfWeek, type } = body ?? {};

  if (time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return NextResponse.json({ error: "time must be HH:mm" }, { status: 400 });
  }

  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      ...(label !== undefined ? { label } : {}),
      ...(time !== undefined ? { time } : {}),
      ...(question !== undefined ? { question } : {}),
      ...(active !== undefined ? { active } : {}),
      ...(daysOfWeek !== undefined ? { daysOfWeek } : {}),
      ...(type !== undefined ? { type } : {}),
    },
  });

  return NextResponse.json({ reminder });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.reminder.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

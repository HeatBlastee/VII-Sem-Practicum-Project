import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const elder = await prisma.elder.findUnique({
    where: { id },
    include: {
      caregivers: { include: { caregiver: true } },
      reminders: { orderBy: { time: "asc" } },
      moodLogs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!elder) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ elder });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, phone, avatarColor, timezone, cameraUrl } = body ?? {};

  const elder = await prisma.elder.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(avatarColor !== undefined ? { avatarColor } : {}),
      ...(timezone !== undefined ? { timezone } : {}),
      ...(cameraUrl !== undefined ? { cameraUrl: cameraUrl || null } : {}),
    },
  });

  return NextResponse.json({ elder });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.elder.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

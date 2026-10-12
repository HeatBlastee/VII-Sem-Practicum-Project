import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const elders = await prisma.elder.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      caregivers: { include: { caregiver: true } },
      _count: { select: { reminders: true } },
    },
  });
  return NextResponse.json({ elders });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, avatarColor, caregiverId, relation } = body ?? {};

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const elder = await prisma.elder.create({
    data: {
      name,
      phone: phone || null,
      avatarColor: avatarColor || "#5B8DEF",
      ...(caregiverId
        ? { caregivers: { create: { caregiverId, relation: relation || "Child" } } }
        : {}),
    },
  });

  return NextResponse.json({ elder }, { status: 201 });
}

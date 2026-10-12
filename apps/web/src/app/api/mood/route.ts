import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { elderId, mood, note } = body ?? {};

  if (!elderId || !mood) {
    return NextResponse.json({ error: "elderId and mood are required" }, { status: 400 });
  }

  const moodLog = await prisma.moodLog.create({
    data: { elderId, mood, note: note || null },
  });

  return NextResponse.json({ moodLog }, { status: 201 });
}

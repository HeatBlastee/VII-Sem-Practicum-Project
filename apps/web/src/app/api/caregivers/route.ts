import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const caregivers = await prisma.caregiver.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ caregivers });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email } = body ?? {};
  if (!name || !email) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }
  const caregiver = await prisma.caregiver.create({ data: { name, email } });
  return NextResponse.json({ caregiver }, { status: 201 });
}

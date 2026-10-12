import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ElderDashboard } from "@/components/ElderDashboard";

export const dynamic = "force-dynamic";

export default async function ElderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const elder = await prisma.elder.findUnique({
    where: { id },
    include: {
      caregivers: { include: { caregiver: true } },
      reminders: { orderBy: { time: "asc" } },
      moodLogs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!elder) notFound();

  const since = new Date();
  since.setDate(since.getDate() - 13);

  const checkIns = await prisma.checkIn.findMany({
    where: { elderId: id, scheduledFor: { gte: since } },
    include: { reminder: true },
    orderBy: { scheduledFor: "desc" },
  });

  return (
    <ElderDashboard
      elder={JSON.parse(JSON.stringify(elder))}
      initialCheckIns={JSON.parse(JSON.stringify(checkIns))}
    />
  );
}

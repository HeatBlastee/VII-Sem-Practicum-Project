import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function HomePage() {
  const elders = await prisma.elder.findMany({
    orderBy: { createdAt: "asc" },
    include: { caregivers: { include: { caregiver: true } } },
  });

  const today = startOfDay(new Date());

  const summaries = await Promise.all(
    elders.map(async (elder) => {
      const checkIns = await prisma.checkIn.findMany({
        where: { elderId: elder.id, scheduledFor: { gte: today } },
      });
      const done = checkIns.filter((c) => c.status.startsWith("DONE")).length;
      const missed = checkIns.filter((c) => c.status === "MISSED").length;
      const pending = checkIns.filter((c) => c.status === "PENDING").length;
      return { elder, done, missed, pending, total: checkIns.length };
    })
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Your family</h1>
          <p className="mt-1 text-sm text-slate-500">
            Today&apos;s medicine, meal, and sleep check-ins at a glance.
          </p>
        </div>
        <Link
          href="/elders/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-md"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
          </svg>
          Add a parent
        </Link>
      </div>

      {summaries.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-10 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a4 4 0 100 8 4 4 0 000-8zM4 20a8 8 0 0116 0" />
            </svg>
          </div>
          <p className="font-medium text-slate-700">No one added yet</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Add a parent to start scheduling medicine, meal, and sleep check-ins.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map(({ elder, done, missed, pending, total }) => (
          <Link
            key={elder.id}
            href={`/elders/${elder.id}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/60"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ring-4 ring-white"
                style={{ backgroundColor: elder.avatarColor }}
              >
                {elder.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-900 group-hover:text-indigo-600">
                  {elder.name}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {elder.caregivers.map((c) => c.relation).join(", ") || "No relation set"}
                </div>
              </div>
              <svg
                className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[var(--success-soft)] py-2.5">
                <div className="text-lg font-semibold text-[var(--success)]">{done}</div>
                <div className="text-[11px] font-medium text-emerald-700/60">Done</div>
              </div>
              <div className="rounded-xl bg-slate-50 py-2.5">
                <div className="text-lg font-semibold text-slate-600">{pending}</div>
                <div className="text-[11px] font-medium text-slate-400">Pending</div>
              </div>
              <div className="rounded-xl bg-[var(--danger-soft)] py-2.5">
                <div className="text-lg font-semibold text-[var(--danger)]">{missed}</div>
                <div className="text-[11px] font-medium text-rose-700/60">Missed</div>
              </div>
            </div>

            {total === 0 && (
              <p className="mt-3 text-xs text-slate-400">No reminders scheduled today.</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

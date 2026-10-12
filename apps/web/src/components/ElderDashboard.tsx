"use client";

import Link from "next/link";
import { LiveFeed } from "@/components/LiveFeed";
import { AdherenceChart } from "@/components/AdherenceChart";
import { ReminderManager } from "@/components/ReminderManager";
import { StatusBadge } from "@/components/StatusBadge";

type Elder = {
  id: string;
  name: string;
  phone: string | null;
  avatarColor: string;
  cameraUrl: string | null;
  caregivers: { relation: string; caregiver: { name: string } }[];
  reminders: {
    id: string;
    type: string;
    label: string;
    time: string;
    question: string;
    active: boolean;
    daysOfWeek: string;
  }[];
  moodLogs: { id: string; mood: string; note: string | null; createdAt: string }[];
};

type CheckIn = {
  id: string;
  scheduledFor: string;
  status: string;
  response: string | null;
  reminder: { label: string; type: string };
};

const MOOD_EMOJI: Record<string, string> = { great: "😄", okay: "🙂", not_great: "😕" };

export function ElderDashboard({
  elder,
  initialCheckIns,
}: {
  elder: Elder;
  initialCheckIns: CheckIn[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"
            clipRule="evenodd"
          />
        </svg>
        All family members
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white ring-4 ring-white"
            style={{ backgroundColor: elder.avatarColor }}
          >
            {elder.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">{elder.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {elder.phone || "No phone on file"}
              <span className="mx-1.5 text-slate-300">·</span>
              {elder.caregivers.map((c) => `${c.caregiver.name} (${c.relation})`).join(", ")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <LiveFeed elderId={elder.id} elderName={elder.name} cameraUrl={elder.cameraUrl} />
          <AdherenceChart checkIns={initialCheckIns} />
          <ReminderManager elderId={elder.id} reminders={elder.reminders} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-medium text-slate-900">
              <SectionIcon>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.5 9.5c.5-1 1.5-1 2 0s1.5 1 2 0M8 14s1.5 2 4 2 4-2 4-2M12 3a9 9 0 100 18 9 9 0 000-18z"
                />
              </SectionIcon>
              Recent mood check-ins
            </h2>
            {elder.moodLogs.length === 0 && (
              <p className="text-sm text-slate-500">No mood logs yet.</p>
            )}
            <ul className="space-y-1">
              {elder.moodLogs.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                >
                  <span className="text-lg">{MOOD_EMOJI[m.mood] ?? "🙂"}</span>
                  <span className="text-slate-600">{m.note || m.mood.replace("_", " ")}</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {new Date(m.createdAt).toLocaleDateString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-medium text-slate-900">
              <SectionIcon>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </SectionIcon>
              Check-in history
            </h2>
            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {initialCheckIns.length === 0 && (
                <p className="text-sm text-slate-500">No check-ins recorded yet.</p>
              )}
              {initialCheckIns.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-800">{c.reminder.label}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(c.scheduledFor).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="h-4 w-4 text-indigo-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      {children}
    </svg>
  );
}

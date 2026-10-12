"use client";

import { useState } from "react";
import { REMINDER_TYPE_LABELS, REMINDER_TYPES, WEEKDAY_LABELS, ReminderType } from "@/lib/types";

type Reminder = {
  id: string;
  type: string;
  label: string;
  time: string;
  question: string;
  active: boolean;
  daysOfWeek: string;
};

const DEFAULT_QUESTIONS: Record<ReminderType, string> = {
  MEDICINE: "Did you take your medicine?",
  MEAL: "Have you eaten?",
  SLEEP: "Are you getting ready for bed?",
  WAKE: "Good morning! Are you awake?",
  CUSTOM: "Just checking in — all good?",
};

const TYPE_STYLE: Record<ReminderType, { emoji: string; bg: string; text: string }> = {
  MEDICINE: { emoji: "💊", bg: "bg-indigo-50", text: "text-indigo-600" },
  MEAL: { emoji: "🍽️", bg: "bg-amber-50", text: "text-amber-600" },
  SLEEP: { emoji: "🌙", bg: "bg-violet-50", text: "text-violet-600" },
  WAKE: { emoji: "☀️", bg: "bg-sky-50", text: "text-sky-600" },
  CUSTOM: { emoji: "🔔", bg: "bg-slate-100", text: "text-slate-600" },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export function ReminderManager({ elderId, reminders }: { elderId: string; reminders: Reminder[] }) {
  const [list, setList] = useState(reminders);
  const [showForm, setShowForm] = useState(false);

  async function toggleActive(reminder: Reminder) {
    const res = await fetch(`/api/reminders/${reminder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !reminder.active }),
    });
    const { reminder: updated } = await res.json();
    setList((l) => l.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function remove(id: string) {
    if (!confirm("Remove this reminder?")) return;
    await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    setList((l) => l.filter((r) => r.id !== id));
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-medium text-slate-900">
          <svg
            className="h-4 w-4 text-indigo-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Medicine, meal & sleep reminders
        </h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-100 transition hover:bg-indigo-700"
        >
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
              </svg>
              Add reminder
            </>
          )}
        </button>
      </div>

      {showForm && (
        <AddReminderForm
          elderId={elderId}
          onCreated={(r) => {
            setList((l) => [...l, r].sort((a, b) => a.time.localeCompare(b.time)));
            setShowForm(false);
          }}
        />
      )}

      {list.length === 0 && !showForm && (
        <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No reminders yet. Add a medicine, meal, or sleep time.
        </p>
      )}

      <ul className="mt-1 divide-y divide-slate-100">
        {list.map((reminder) => {
          const style = TYPE_STYLE[reminder.type as ReminderType] ?? TYPE_STYLE.CUSTOM;
          return (
            <li key={reminder.id} className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${style.bg}`}
                >
                  {style.emoji}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-600">
                      {reminder.time}
                    </span>
                    <span className="truncate text-sm font-medium text-slate-900">{reminder.label}</span>
                    <span className={`text-[11px] font-medium ${style.text}`}>
                      {REMINDER_TYPE_LABELS[reminder.type as ReminderType] ?? reminder.type}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">{reminder.question}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={reminder.active}
                  onClick={() => toggleActive(reminder)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    reminder.active ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                  title={reminder.active ? "Active" : "Paused"}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                      reminder.active ? "left-4.5" : "left-0.5"
                    }`}
                  />
                </button>
                <button
                  onClick={() => remove(reminder.id)}
                  className="text-slate-400 transition hover:text-rose-600"
                  title="Remove reminder"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.808a2.75 2.75 0 002.741-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AddReminderForm({
  elderId,
  onCreated,
}: {
  elderId: string;
  onCreated: (r: Reminder) => void;
}) {
  const [type, setType] = useState<ReminderType>("MEDICINE");
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("08:00");
  const [question, setQuestion] = useState(DEFAULT_QUESTIONS.MEDICINE);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elderId, type, label, time, question }),
    });
    if (res.ok) {
      const { reminder } = await res.json();
      onCreated(reminder);
    }
    setSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 grid grid-cols-1 gap-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2"
    >
      <div>
        <label className="block text-xs font-medium text-slate-600">Type</label>
        <select
          value={type}
          onChange={(e) => {
            const t = e.target.value as ReminderType;
            setType(t);
            setQuestion(DEFAULT_QUESTIONS[t]);
          }}
          className={inputClass}
        >
          {REMINDER_TYPES.map((t) => (
            <option key={t} value={t}>
              {REMINDER_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Time</label>
        <input
          type="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-600">Label</label>
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Blood pressure tablet"
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-600">Question sent to the app</label>
        <input
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="text-xs text-slate-400 sm:col-span-2">
        Repeats every day ({WEEKDAY_LABELS.join(", ")}). Per-day scheduling coming soon.
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save reminder"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const COLORS = ["#5B8DEF", "#E4864E", "#4CAF93", "#B15BE0", "#E0575B"];

export default function NewElderPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Child");
  const [color, setColor] = useState(COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const caregiversRes = await fetch("/api/caregivers").then((r) => r.json());
      let caregiverId = caregiversRes.caregivers?.[0]?.id;
      if (!caregiverId) {
        const created = await fetch("/api/caregivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Family Caregiver", email: "family@example.com" }),
        }).then((r) => r.json());
        caregiverId = created.caregiver.id;
      }

      const res = await fetch("/api/elders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatarColor: color, caregiverId, relation }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const { elder } = await res.json();
      router.push(`/elders/${elder.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Add a parent</h1>
      <p className="mt-1 text-sm text-slate-500">
        They&apos;ll get their own app to receive reminders and check in.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Rameshbhai Shah"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Phone (optional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+91-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Your relation</label>
          <select value={relation} onChange={(e) => setRelation(e.target.value)} className={inputClass}>
            {["Child", "Daughter", "Son", "Grandchild", "Relative"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Color tag</label>
          <div className="mt-2 flex gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full ring-2 ring-offset-2 transition ${
                  color === c ? "ring-slate-900" : "ring-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add parent"}
        </button>
      </form>
    </div>
  );
}

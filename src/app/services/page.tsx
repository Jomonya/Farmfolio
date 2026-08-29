"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { SERVICES, TIME_SLOTS } from "@/lib/content";
import type { Veterinarian } from "@/lib/types";

export default function ServicesPage() {
  const { user } = useAuth();
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [selectedVet, setSelectedVet] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const url = new URL("/api/veterinarians", window.location.origin);
    if (q.trim()) url.searchParams.set("q", q.trim());
    const res = await fetch(url, { cache: "no-store" });
    setVets(res.ok ? await res.json() : []);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function book(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ veterinarianId: selectedVet, date, timeSlot, notes }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not book");
      setMsg({ ok: true, text: "Consultation booked. See it on your dashboard." });
      setSelectedVet("");
      setDate("");
      setTimeSlot("");
      setNotes("");
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Could not book",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col">
      <section className="bg-farm-500 text-white">
        <div className="container-page py-12">
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="mt-2 max-w-2xl text-farm-50">
            Our accredited veterinary officers offer consultation and treatment
            for livestock: routine checks, specialised care and emergencies.
            Book a time below and a vet will confirm.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s) => (
          <a
            key={s.slug}
            id={s.slug}
            href="#book"
            className="group scroll-mt-20 rounded-xl border border-farm-100 bg-white p-5 shadow-sm transition-colors hover:border-farm-300 hover:bg-farm-50"
          >
            <h3 className="font-semibold text-farm-700 group-hover:underline">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-600">{s.description}</p>
          </a>
        ))}
      </section>

      <section className="container-page grid gap-8 pb-16 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-farm-700">
              Available veterinary officers
            </h2>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by specialization..."
              className="w-56 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
            />
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-200" />
              ))}
            </div>
          ) : vets.length === 0 ? (
            <p className="mt-6 text-neutral-500">No veterinarians found.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {vets.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center gap-4 rounded-xl border border-farm-100 bg-white p-4 shadow-sm"
                >
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-farm-700">{v.name}</p>
                    <p className="text-sm text-neutral-500">
                      {v.specialization} - {v.location}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">{v.bio}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedVet(v.id);
                      document
                        .getElementById("book")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="rounded-md border border-farm-300 px-3 py-1.5 text-sm font-medium text-farm-700 hover:bg-farm-50"
                  >
                    Select
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside
          id="book"
          className="h-fit rounded-xl border border-farm-100 bg-white p-6 shadow-sm lg:sticky lg:top-20"
        >
          <h2 className="text-lg font-bold text-farm-700">Book a consultation</h2>

          {!user ? (
            <p className="mt-3 text-sm text-neutral-600">
              Please{" "}
              <Link
                href="/login?next=/services"
                className="font-medium text-farm-600 hover:underline"
              >
                sign in
              </Link>{" "}
              to book a vet.
            </p>
          ) : (
            <form onSubmit={book} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">
                  Veterinarian
                </span>
                <select
                  value={selectedVet}
                  onChange={(e) =>
                    setSelectedVet(e.target.value ? Number(e.target.value) : "")
                  }
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500"
                >
                  <option value="">Select a vet...</option>
                  {vets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.specialization})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">
                  Date
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">
                  Time
                </span>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500"
                >
                  <option value="">Select time...</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">
                  Notes (optional)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500"
                />
              </label>

              {msg && (
                <p
                  className={`text-sm font-medium ${
                    msg.ok ? "text-farm-600" : "text-red-600"
                  }`}
                >
                  {msg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-md bg-farm-500 px-4 py-2.5 font-medium text-white hover:bg-farm-600 disabled:opacity-60"
              >
                {busy ? "Booking..." : "Book Consultation"}
              </button>
            </form>
          )}
        </aside>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Note = { id: string; title: string; body: string; updatedAt: number };

const KEY = "farmfolio_notebooks";

export default function NotebooksPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(notes));
    } catch {
      /* ignore */
    }
  }, [notes, hydrated]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setNotes((n) => [
      { id: crypto.randomUUID(), title: title.trim(), body: body.trim(), updatedAt: Date.now() },
      ...n,
    ]);
    setTitle("");
    setBody("");
  }

  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold text-farm-700">Notebooks</h1>
      <p className="mt-1 text-sm text-neutral-500">
        A simple farm journal for planting dates, treatments and observations.
        Saved in this browser.
      </p>

      <form
        onSubmit={add}
        className="mt-6 space-y-3 rounded-xl border border-farm-100 bg-white p-5 shadow-sm"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. North plot: maize planted)"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Details..."
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
        />
        <button className="rounded-md bg-farm-500 px-4 py-2 text-sm font-medium text-white hover:bg-farm-600">
          Add entry
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {notes.map((n) => (
          <li
            key={n.id}
            className="rounded-xl border border-farm-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-farm-700">{n.title}</h3>
              <button
                onClick={() => setNotes((all) => all.filter((x) => x.id !== n.id))}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
            {n.body && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">
                {n.body}
              </p>
            )}
            <p className="mt-2 text-xs text-neutral-400">
              {new Date(n.updatedAt).toLocaleString()}
            </p>
          </li>
        ))}
        {hydrated && notes.length === 0 && (
          <li className="text-sm text-neutral-500">No entries yet.</li>
        )}
      </ul>
    </div>
  );
}

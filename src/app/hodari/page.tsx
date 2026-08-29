"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "hodari"; text: string };

const SUGGESTIONS = [
  "How do I space maize?",
  "What ration for a dairy cow?",
  "When do layers start producing?",
  "How should I use fertilizer?",
];

export default function HodariPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "hodari",
      text: "Habari! I'm Hodari, your farming assistant. Ask me about crops, livestock, soil, pests, the market, or keeping records.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/hodari", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const body = await res.json();
      setMessages((m) => [
        ...m,
        { role: "hodari", text: body.reply ?? "Sorry, I couldn't answer that." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "hodari", text: "Something went wrong. Try again." },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() =>
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight }),
      );
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-farm-700">Ask Hodari</h1>
        <p className="mt-1 text-sm text-neutral-500">
          A quick farming assistant. Answers are general guidance. For anything
          serious, book an expert on the Services page.
        </p>

        <div
          ref={listRef}
          className="mt-6 h-[420px] space-y-3 overflow-y-auto rounded-xl border border-farm-100 bg-white p-4 shadow-sm"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-farm-500 text-white"
                    : "bg-farm-50 text-farm-900"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-farm-50 px-4 py-2 text-sm text-farm-500">
                Hodari is typing...
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-farm-200 px-3 py-1 text-xs text-farm-700 hover:bg-farm-50"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a farming question..."
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-farm-500 px-5 py-2 font-medium text-white hover:bg-farm-600 disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

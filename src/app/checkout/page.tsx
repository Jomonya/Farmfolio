"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { formatKes } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lines, total } = useCart();

  const [buyerName, setBuyerName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          buyerName,
          items: lines.map((l) => ({ productId: l.id, quantity: l.qty })),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not start payment");
      router.push(`/orders/${body.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment");
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
        <h1 className="text-xl font-semibold text-farm-700">Your cart is empty</h1>
        <Link
          href="/market"
          className="mt-4 rounded-md bg-farm-500 px-5 py-2.5 font-medium text-white hover:bg-farm-600"
        >
          Browse the market
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
        <h1 className="text-xl font-semibold text-farm-700">
          Sign in to check out
        </h1>
        <Link
          href="/login?next=/checkout"
          className="mt-4 rounded-md bg-farm-500 px-5 py-2.5 font-medium text-white hover:bg-farm-600"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-2xl font-bold text-farm-700">Checkout</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Pay with M-Pesa. You will get an STK push on your phone to authorise
          the payment.
        </p>

        <form
          onSubmit={pay}
          className="mt-6 space-y-4 rounded-xl border border-farm-100 bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Name
            </span>
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              M-Pesa phone number
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              inputMode="numeric"
              placeholder="0712345678"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
            />
            <span className="mt-1 block text-xs text-neutral-400">
              Safaricom number, e.g. 0712345678 or 254712345678.
            </span>
          </label>

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-farm-500 px-4 py-2.5 font-medium text-white hover:bg-farm-600 disabled:opacity-60"
          >
            {busy ? "Starting payment..." : `Pay ${formatKes(total)} with M-Pesa`}
          </button>
        </form>
      </div>

      <aside className="h-fit rounded-xl border border-farm-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-farm-700">Order summary</h2>
        <ul className="mt-3 divide-y divide-neutral-100">
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between py-2 text-sm">
              <span>
                {l.name} x {l.qty}
              </span>
              <span>{formatKes(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-neutral-100 pt-3 font-semibold">
          <span>Total</span>
          <span className="text-farm-700">{formatKes(total)}</span>
        </div>
      </aside>
    </div>
  );
}

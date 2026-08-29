"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { PRODUCT_CATEGORIES } from "@/lib/content";
import { formatKes, type Product } from "@/lib/types";

export default function MarketPage() {
  const { user } = useAuth();
  const cart = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const url = new URL("/api/products", window.location.origin);
    if (q.trim()) url.searchParams.set("q", q.trim());
    if (category !== "All") url.searchParams.set("category", category);
    const res = await fetch(url, { cache: "no-store" });
    setProducts(res.ok ? await res.json() : []);
    setLoading(false);
  }, [q, category]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="flex flex-col">
      <section className="bg-farm-500 text-white">
        <div className="container-page grid gap-8 py-12 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Karibu Soko!</h1>
            <p className="mt-2 max-w-md text-farm-50">
              Unaweza kuuza au kununua bidhaa kwa njia rahisi. Buy and sell farm
              goods the easy way.
            </p>
          </div>
          <div className="hidden gap-3 md:flex">
            <img
              src="/images/site/chicken.jpg"
              alt="Market produce"
              className="h-32 w-44 rounded-lg object-cover shadow-md"
            />
            <img
              src="/images/site/hen.jpg"
              alt="Market trader"
              className="h-32 w-44 rounded-lg object-cover shadow-md"
            />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="min-w-56 flex-1 rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500"
            >
              <option>All</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {user ? (
              <button
                onClick={() => setShowForm((v) => !v)}
                className="rounded-md bg-farm-500 px-4 py-2 text-sm font-medium text-white hover:bg-farm-600"
              >
                {showForm ? "Close form" : "Add a product"}
              </button>
            ) : (
              <Link
                href="/login?next=/market"
                className="rounded-md border border-farm-300 px-4 py-2 text-sm font-medium text-farm-700 hover:bg-farm-50"
              >
                Sign in to sell
              </Link>
            )}
          </div>

          {showForm && user && (
            <AddProductForm
              onDone={() => {
                setShowForm(false);
                load();
              }}
            />
          )}

          {loading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl bg-neutral-200"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="mt-10 text-neutral-500">No products match your search.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-farm-100 bg-white shadow-sm"
                >
                  <Link href={`/market/${p.id}`}>
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-40 w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/market/${p.id}`}
                        className="font-semibold text-farm-700 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <span className="whitespace-nowrap text-sm font-medium">
                        {formatKes(p.price)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                      {p.description}
                    </p>
                    <p className="mt-2 text-xs text-neutral-400">
                      Location: {p.location}
                    </p>
                    <button
                      onClick={() => cart.add(p)}
                      className="mt-3 rounded-md bg-farm-500 px-3 py-2 text-sm font-medium text-white hover:bg-farm-600"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CartPanel />
      </section>
    </div>
  );
}

function CartPanel() {
  const { lines, total, setQty, remove, clear } = useCart();

  return (
    <aside
      id="cart"
      className="h-fit rounded-xl border border-farm-100 bg-white p-5 shadow-sm lg:sticky lg:top-20"
    >
      <h2 className="text-lg font-bold text-farm-700">Shopping Cart</h2>

      {lines.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">Your cart is empty.</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-100">
          {lines.map((l) => (
            <li key={l.id} className="flex gap-3 py-3">
              <img
                src={l.imageUrl}
                alt={l.name}
                className="h-14 w-14 rounded-md object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>{l.name}</span>
                  <span>{formatKes(l.price * l.qty)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <button
                    onClick={() => setQty(l.id, l.qty - 1)}
                    className="h-6 w-6 rounded border border-neutral-300"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span>{l.qty}</span>
                  <button
                    onClick={() => setQty(l.id, l.qty + 1)}
                    className="h-6 w-6 rounded border border-neutral-300"
                  >
                    +
                  </button>
                  <button
                    onClick={() => remove(l.id)}
                    className="ml-auto text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
        <span className="font-semibold">Total</span>
        <span className="font-bold text-farm-700">{formatKes(total)}</span>
      </div>
      {lines.length > 0 && (
        <div className="mt-3 flex gap-2">
          <Link
            href="/checkout"
            className="flex-1 rounded-md bg-farm-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-farm-600"
          >
            Checkout
          </Link>
          <button
            onClick={clear}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            Clear
          </button>
        </div>
      )}
    </aside>
  );
}

function AddProductForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    name: "",
    imageUrl: "",
    description: "",
    price: "",
    location: "",
    category: "Other",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not add product");
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-5 grid gap-3 rounded-xl border border-farm-100 bg-white p-5 shadow-sm sm:grid-cols-2"
    >
      <Input label="Name" value={form.name} onChange={(v) => set("name", v)} required />
      <Input
        label="Image URL"
        value={form.imageUrl}
        onChange={(v) => set("imageUrl", v)}
        placeholder="https://..."
        required
      />
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Description
        </span>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
        />
      </label>
      <Input
        label="Price (KES)"
        type="number"
        value={form.price}
        onChange={(v) => set("price", v)}
        required
      />
      <Input
        label="Location"
        value={form.location}
        onChange={(v) => set("location", v)}
        required
      />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Category
        </span>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500"
        >
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      {error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">{error}</p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-farm-500 px-4 py-2 font-medium text-white hover:bg-farm-600 disabled:opacity-60"
        >
          {busy ? "Adding..." : "Add Product"}
        </button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
      />
    </label>
  );
}

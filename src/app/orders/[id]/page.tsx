"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { formatKes, type Order } from "@/lib/types";

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { clear } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const simulateFired = useRef(false);
  const cartCleared = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
    if (!res.ok) {
      setError("Order not found");
      return null;
    }
    const data: Order = await res.json();
    setOrder(data);
    return data;
  }, [id]);

  const simulate = useCallback(
    async (outcome: "success" | "fail") => {
      simulateFired.current = true;
      await fetch(`/api/orders/${id}/simulate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });
      load();
    },
    [id, load],
  );

  // poll while pending
  useEffect(() => {
    let active = true;
    load();
    const t = setInterval(async () => {
      if (!active) return;
      const data = await load();
      if (data && data.status !== "PENDING") clearInterval(t);
    }, 2500);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [load]);

  // in simulate mode, finish the payment after a few seconds. keep the dep a
  // plain bool or the poll above keeps resetting the timer.
  const pendingSimulated =
    order?.status === "PENDING" && !!order?.payment?.simulated;
  useEffect(() => {
    if (!pendingSimulated || simulateFired.current) return;
    const t = setTimeout(() => simulate("success"), 3000);
    return () => clearTimeout(t);
  }, [pendingSimulated, simulate]);

  useEffect(() => {
    if (order?.status === "PAID" && !cartCleared.current) {
      cartCleared.current = true;
      clear();
    }
  }, [order, clear]);

  if (error) {
    return (
      <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
        <h1 className="text-xl font-semibold text-farm-700">{error}</h1>
        <Link href="/market" className="mt-4 text-farm-600 hover:underline">
          Back to the market
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-24 text-center text-neutral-500">
        Loading order...
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-lg rounded-xl border border-farm-100 bg-white p-8 shadow-sm">
        <p className="text-sm text-neutral-400">Order #{order.id}</p>

        {order.status === "PENDING" && (
          <>
            <h1 className="mt-1 text-xl font-bold text-farm-700">
              Waiting for payment
            </h1>
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-farm-50 p-4 text-sm text-farm-800">
              <span className="h-3 w-3 animate-ping rounded-full bg-farm-500" />
              {order.payment?.simulated
                ? "Simulating an M-Pesa STK push..."
                : `An STK push was sent to ${order.buyerPhone}. Enter your M-Pesa PIN to pay ${formatKes(order.totalAmount)}.`}
            </div>

            {order.payment?.simulated && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => simulate("success")}
                  className="rounded-md bg-farm-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-farm-600"
                >
                  Simulate success
                </button>
                <button
                  onClick={() => simulate("fail")}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
                >
                  Simulate failure
                </button>
              </div>
            )}
          </>
        )}

        {order.status === "PAID" && (
          <>
            <h1 className="mt-1 text-xl font-bold text-farm-700">
              Payment received ✓
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Paid {formatKes(order.totalAmount)}
              {order.payment?.mpesaReceipt
                ? ` - M-Pesa ref ${order.payment.mpesaReceipt}`
                : ""}
              .
            </p>
          </>
        )}

        {(order.status === "FAILED" || order.status === "CANCELLED") && (
          <>
            <h1 className="mt-1 text-xl font-bold text-red-600">
              Payment not completed
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {order.payment?.resultDesc ||
                "The payment was cancelled or timed out."}
            </p>
            <Link
              href="/checkout"
              className="mt-4 inline-block rounded-md bg-farm-500 px-4 py-2 text-sm font-medium text-white hover:bg-farm-600"
            >
              Try again
            </Link>
          </>
        )}

        <ul className="mt-6 divide-y divide-neutral-100 border-t border-neutral-100">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between py-2 text-sm">
              <span>
                {it.name} x {it.quantity}
              </span>
              <span>{formatKes(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 font-semibold">
          <span>Total</span>
          <span className="text-farm-700">{formatKes(order.totalAmount)}</span>
        </div>

        <div className="mt-6 flex gap-3 text-sm">
          <Link
            href="/dashboard/orders"
            className="font-medium text-farm-600 hover:underline"
          >
            View all orders
          </Link>
          <Link href="/market" className="text-neutral-500 hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

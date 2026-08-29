import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKes } from "@/lib/types";

export const metadata = { title: "Orders" };

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-farm-100 text-farm-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-neutral-200 text-neutral-600",
};

export default async function OrdersPage() {
  const user = await requireSession();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold text-farm-700">Orders</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Purchases you have made in the market, paid with M-Pesa.
      </p>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          No orders yet.{" "}
          <Link href="/market" className="text-farm-600 hover:underline">
            Visit the market
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-farm-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/orders/${o.id}`}
                    className="font-semibold text-farm-700 hover:underline"
                  >
                    Order #{o.id}
                  </Link>
                  <p className="text-xs text-neutral-400">
                    {new Date(o.createdAt).toLocaleString()} - {o.buyerPhone}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[o.status] ?? "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {o.status}
                </span>
              </div>

              <ul className="mt-3 divide-y divide-neutral-100 border-t border-neutral-100 text-sm">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between py-1.5">
                    <span>
                      {it.name} x {it.quantity}
                    </span>
                    <span>{formatKes(it.unitPrice * it.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-sm font-semibold">
                <span>Total</span>
                <span className="text-farm-700">
                  {formatKes(o.totalAmount)}
                </span>
              </div>
              {o.payment?.mpesaReceipt && (
                <p className="mt-1 text-xs text-neutral-400">
                  M-Pesa ref {o.payment.mpesaReceipt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

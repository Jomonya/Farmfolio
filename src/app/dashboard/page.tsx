import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKes } from "@/lib/types";

export default async function DashboardOverview() {
  const user = await requireSession();

  const [listings, bookings, orders] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { userId: user.id },
      include: { veterinarian: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const listingValue = listings.reduce((n, p) => n + p.price, 0);
  const spent = orders
    .filter((o) => o.status === "PAID")
    .reduce((n, o) => n + o.totalAmount, 0);

  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold text-farm-700">Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Active listings" value={String(listings.length)} />
        <Card label="Listing value" value={formatKes(listingValue)} />
        <Card label="Vet bookings" value={String(bookings.length)} />
        <Card label="Spent in market" value={formatKes(spent)} />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-farm-700">Your listings</h2>
          <Link
            href="/market"
            className="text-sm font-medium text-farm-600 hover:underline"
          >
            Add in the market →
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            You haven't listed anything yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100 rounded-xl border border-farm-100 bg-white shadow-sm">
            {listings.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-3">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <span className="flex-1 text-sm font-medium">{p.name}</span>
                <span className="text-sm">{formatKes(p.price)}</span>
                <Link
                  href={`/market/${p.id}`}
                  className="text-xs text-farm-600 hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-farm-700">Recent orders</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-medium text-farm-600 hover:underline"
          >
            All orders →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            No market purchases yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100 rounded-xl border border-farm-100 bg-white shadow-sm">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between p-3 text-sm"
              >
                <Link
                  href={`/orders/${o.id}`}
                  className="font-medium text-farm-700 hover:underline"
                >
                  Order #{o.id}
                </Link>
                <span className="text-neutral-500">
                  {formatKes(o.totalAmount)}
                </span>
                <span className="rounded-full bg-farm-100 px-2 py-0.5 text-xs text-farm-700">
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-farm-700">Recent bookings</h2>
        {bookings.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            No vet consultations booked.{" "}
            <Link href="/services" className="text-farm-600 hover:underline">
              Book one
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100 rounded-xl border border-farm-100 bg-white shadow-sm">
            {bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between p-3 text-sm">
                <span className="font-medium">{b.veterinarian.name}</span>
                <span className="text-neutral-500">
                  {b.date} at {b.timeSlot}
                </span>
                <span className="rounded-full bg-farm-100 px-2 py-0.5 text-xs text-farm-700">
                  {b.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-farm-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-farm-700">{value}</p>
    </div>
  );
}

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKes } from "@/lib/types";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireSession();
  const listings = await prisma.product.findMany({
    where: { sellerId: user.id },
  });

  const byCategory = new Map<string, { count: number; value: number }>();
  for (const p of listings) {
    const cur = byCategory.get(p.category) ?? { count: 0, value: 0 };
    cur.count += 1;
    cur.value += p.price;
    byCategory.set(p.category, cur);
  }
  const rows = [...byCategory.entries()].sort((a, b) => b[1].value - a[1].value);
  const maxValue = Math.max(1, ...rows.map(([, v]) => v.value));
  const totalValue = listings.reduce((n, p) => n + p.price, 0);

  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold text-farm-700">Analytics</h1>
      <p className="mt-1 text-sm text-neutral-500">
        A breakdown of your current market listings.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card label="Listings" value={String(listings.length)} />
        <Card label="Total value" value={formatKes(totalValue)} />
        <Card
          label="Avg. price"
          value={formatKes(
            listings.length ? Math.round(totalValue / listings.length) : 0,
          )}
        />
      </div>

      <div className="mt-8 rounded-xl border border-farm-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-farm-700">Value by category</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No listings to chart.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map(([cat, v]) => (
              <li key={cat}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat}</span>
                  <span className="text-neutral-500">
                    {v.count} - {formatKes(v.value)}
                  </span>
                </div>
                <div className="mt-1 h-2.5 rounded-full bg-farm-100">
                  <div
                    className="h-2.5 rounded-full bg-farm-500"
                    style={{ width: `${(v.value / maxValue) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
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

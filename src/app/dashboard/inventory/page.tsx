import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKes } from "@/lib/types";
import { DeleteListingButton } from "./DeleteListingButton";

export const metadata = { title: "My Inventory" };

export default async function InventoryPage() {
  const user = await requireSession();
  const listings = await prisma.product.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-farm-700">My Inventory</h1>
        <Link
          href="/market"
          className="rounded-md bg-farm-500 px-4 py-2 text-sm font-medium text-white hover:bg-farm-600"
        >
          Add a product
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Nothing listed yet. Head to the market to add your first product.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-farm-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-farm-50 text-left text-farm-700">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Price</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {listings.map((p) => (
                <tr key={p.id}>
                  <td className="flex items-center gap-3 p-3">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{p.location}</td>
                  <td className="p-3">{formatKes(p.price)}</td>
                  <td className="p-3 text-right">
                    <DeleteListingButton id={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

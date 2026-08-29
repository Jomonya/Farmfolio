import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKes } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: numId },
    include: { seller: { select: { name: true, email: true } } },
  });
  if (!product) notFound();

  return (
    <div className="container-page py-10">
      <Link href="/market" className="text-sm text-farm-600 hover:underline">
        ← Back to market
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-[4/3] w-full rounded-xl border border-farm-100 object-cover"
        />

        <div>
          <span className="inline-block rounded-full bg-farm-100 px-3 py-1 text-xs font-medium text-farm-700">
            {product.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-farm-700">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-semibold">
            {formatKes(product.price)}
          </p>
          <p className="mt-4 text-neutral-600">{product.description}</p>

          <dl className="mt-6 space-y-1 text-sm text-neutral-600">
            <div className="flex gap-2">
              <dt className="font-medium">Location:</dt>
              <dd>{product.location}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Seller:</dt>
              <dd>{product.seller?.name || product.seller?.email || "FarmFolio"}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

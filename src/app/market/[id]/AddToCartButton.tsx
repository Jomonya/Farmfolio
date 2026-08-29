"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";

export function AddToCartButton({
  product,
}: {
  product: { id: number; name: string; price: number; imageUrl: string };
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          add(product);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="rounded-md bg-farm-500 px-5 py-2.5 font-medium text-white hover:bg-farm-600"
      >
        {added ? "Added ✓" : "Add to Cart"}
      </button>
      <Link
        href="/market#cart"
        className="text-sm font-medium text-farm-600 hover:underline"
      >
        View cart
      </Link>
    </div>
  );
}

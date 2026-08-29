"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteListingButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Remove this listing?")) return;
    setBusy(true);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Could not remove listing");
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {busy ? "Removing..." : "Remove"}
    </button>
  );
}

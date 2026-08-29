"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/inventory", label: "My Inventory" },
  { href: "/dashboard/notebooks", label: "Notebooks" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/training", label: "Training" },
  { href: "/dashboard/help", label: "Help" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-4 rounded-md border border-farm-200 px-3 py-2 text-sm font-medium text-farm-700 md:hidden"
      >
        {open ? "Hide menu" : "Menu"}
      </button>

      <nav
        className={`${
          open ? "block" : "hidden"
        } md:block md:sticky md:top-20 md:h-fit`}
      >
        <ul className="space-y-1 rounded-xl border border-farm-100 bg-white p-2 shadow-sm">
          {LINKS.map((l) => {
            const active =
              l.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm ${
                    active
                      ? "bg-farm-500 font-medium text-white"
                      : "text-neutral-700 hover:bg-farm-50"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

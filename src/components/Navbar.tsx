"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/market", label: "Market" },
  { href: "/hodari", label: "Ask Hodari" },
  { href: "/services", label: "Services" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-farm-500 text-white shadow-sm">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo className="h-8 w-8" />
          <span className="hidden sm:inline">FarmFolio</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-farm-600 ${
                isActive(item.href) ? "bg-farm-600 font-medium" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/market#cart"
            className="relative rounded-md px-3 py-2 text-sm hover:bg-farm-600"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-semibold text-farm-700">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm hover:bg-farm-600"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-white/60 px-3 py-1.5 text-sm hover:bg-white hover:text-farm-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-white/60 px-3 py-1.5 text-sm hover:bg-white hover:text-farm-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-farm-700 hover:bg-farm-50"
              >
                Signup
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 hover:bg-farm-600 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-farm-600 bg-farm-500 px-5 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm hover:bg-farm-600 ${
                  isActive(item.href) ? "bg-farm-600 font-medium" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/market#cart"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm hover:bg-farm-600"
            >
              Cart {count > 0 ? `(${count})` : ""}
            </Link>
            <div className="mt-2 flex gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-md bg-white px-3 py-2 text-center text-sm font-medium text-farm-700"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex-1 rounded-md border border-white/60 px-3 py-2 text-sm"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-md border border-white/60 px-3 py-2 text-center text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-md bg-white px-3 py-2 text-center text-sm font-medium text-farm-700"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

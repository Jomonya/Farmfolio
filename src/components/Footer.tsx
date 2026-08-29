import Link from "next/link";
import { Logo } from "@/components/Logo";
import { FOOTER_LINKS, SERVICES } from "@/lib/content";

export function Footer() {
  return (
    <footer className="mt-auto bg-farm-700 text-farm-50">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-white">
            <Logo className="h-8 w-8" />
            FarmFolio
          </div>
          <p className="mt-3 text-sm text-farm-100">
            Farm records at your fingertips. Track your produce, sell in the
            market, and reach vets and agronomists in one place.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Company
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Services
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services#${s.slug}`} className="hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Get started
          </h3>
          <p className="mt-3 text-sm text-farm-100">
            Take control of your farming.
          </p>
          <Link
            href="/register"
            className="mt-3 inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-farm-700 hover:bg-farm-50"
          >
            Create an account
          </Link>
        </div>
      </div>

      <div className="border-t border-farm-600">
        <div className="container-page py-4 text-center text-xs text-farm-100">
          © {new Date().getFullYear()} FarmFolio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

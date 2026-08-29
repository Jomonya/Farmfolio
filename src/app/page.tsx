import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKes } from "@/lib/types";
import {
  CASE_STUDY,
  FEATURED_ARTICLE,
  SERVICES,
  TESTIMONIAL,
} from "@/lib/content";

export default async function HomePage() {
  const [products, vetCount] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.veterinarian.count(),
  ]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-farm-600 text-white">
        <img
          src="/images/site/hero.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative container-page grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up">
            <p className="text-sm font-medium uppercase tracking-widest text-farm-100">
              Welcome to FarmFolio
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              Take your farm management to the next level
            </h1>
            <p className="mt-5 max-w-lg text-farm-50">
              Keep a record of your produce so optimisation is easy and fast.
              Sign in to the farm management system to access your records and
              analytics. You can also buy or sell farm tools, fertilizers, seeds and vet
              services along the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-md bg-white px-5 py-2.5 font-medium text-farm-700 hover:bg-farm-50"
              >
                Get started
              </Link>
              <Link
                href="/market"
                className="rounded-md border border-white/70 px-5 py-2.5 font-medium hover:bg-farm-600"
              >
                Check out the market
              </Link>
            </div>
          </div>

          <div className="animate-fade-up rounded-xl bg-farm-600/60 p-6 backdrop-blur">
            <div className="grid grid-cols-3 gap-4 text-center">
              <Stat value={`${products.length ? "8+" : "0"}`} label="Listings" />
              <Stat value={`${vetCount}`} label="Vets on call" />
              <Stat value="24/7" label="Records access" />
            </div>
            <blockquote className="mt-6 border-t border-white/20 pt-6">
              <p className="text-lg">"{TESTIMONIAL.quote}"</p>
              <footer className="mt-3 text-sm text-farm-100">
                {TESTIMONIAL.author}, {TESTIMONIAL.title}
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-bold text-farm-700">
          A world-class farm management system for every farmer
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Records & analytics",
              body: "Log inputs, yields and costs. See your real cost of production per crop and per season.",
              href: "/dashboard/analytics",
            },
            {
              title: "Marketplace",
              body: "List livestock, produce and equipment, or buy what you need from other farmers.",
              href: "/market",
            },
            {
              title: "Expert services",
              body: "Book vets, training and agronomy consults without leaving the platform.",
              href: "/services",
            },
          ].map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group rounded-xl border border-farm-100 bg-white p-6 shadow-sm transition-colors hover:border-farm-300 hover:bg-farm-50"
            >
              <h3 className="font-semibold text-farm-700 group-hover:underline">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">{c.body}</p>
              <span className="mt-3 inline-block text-sm font-medium text-farm-600">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-farm-700">Fresh in the market</h2>
            <Link
              href="/market"
              className="text-sm font-medium text-farm-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/market/${p.id}`}
                className="group overflow-hidden rounded-xl border border-farm-100 bg-white shadow-sm"
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-44 w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-farm-700">{p.name}</h3>
                    <span className="text-sm font-medium">
                      {formatKes(p.price)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {p.description}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    Location: {p.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-bold text-farm-700">Services</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/services#${s.slug}`}
              className="group rounded-xl border border-farm-100 bg-white p-5 shadow-sm transition-colors hover:border-farm-300 hover:bg-farm-50"
            >
              <h3 className="font-semibold text-farm-700 group-hover:underline">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <article>
            <p className="text-xs font-semibold uppercase tracking-widest text-farm-500">
              {FEATURED_ARTICLE.kicker}
            </p>
            <h2 className="mt-2 text-xl font-bold text-farm-700">
              {FEATURED_ARTICLE.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {FEATURED_ARTICLE.body}
            </p>
          </article>
          <article>
            <p className="text-xs font-semibold uppercase tracking-widest text-farm-500">
              {CASE_STUDY.kicker}
            </p>
            <h2 className="mt-2 text-xl font-bold text-farm-700">
              {CASE_STUDY.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {CASE_STUDY.body}
            </p>
          </article>
        </div>
      </section>

      <section className="bg-farm-700 text-white">
        <div className="container-page flex flex-col items-center gap-4 py-14 text-center">
          <h2 className="text-2xl font-bold">Access the farm management system</h2>
          <p className="text-farm-100">Take control of your farming.</p>
          <Link
            href="/login"
            className="rounded-md bg-white px-6 py-2.5 font-medium text-farm-700 hover:bg-farm-50"
          >
            Login
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-farm-100">{label}</div>
    </div>
  );
}

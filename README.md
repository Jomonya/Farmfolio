# FarmFolio

Farm management app for smallholder farmers - keep records, buy/sell in the
market, book a vet, ask a quick farming assistant.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind · Prisma + SQLite.

## Running locally

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Then http://localhost:3000. Demo account: `demo@farmfolio.app` / `password123`.

Scripts: `db:push`, `db:seed`, `db:reset`, `db:studio`, `lint`, `build`.

## Notes

- Auth is a JWT in an httpOnly cookie (`jose` + `bcryptjs`). `proxy.ts` does a
  cheap cookie check for `/dashboard`, `/checkout`, `/orders`; the pages verify
  the token properly.
- Checkout uses M-Pesa STK push (Safaricom Daraja). Without credentials it runs
  in a simulated mode so the flow still works - set the `MPESA_*` vars and
  `MPESA_SIMULATE=false` (plus a public callback URL) to go live. See
  `src/lib/mpesa.ts`.
- Cart is client-side (localStorage).
- Google sign-in button is a placeholder.

## Deploy

SQLite is fine locally but won't persist on serverless hosts - point the Prisma
datasource at Postgres (or Turso) and set `DATABASE_URL` / `JWT_SECRET` in the
environment.

# FarmFolio

Farm management app for smallholder farmers - keep records, buy/sell in the
market, book a vet, ask a quick farming assistant.

Next.js 16 (App Router), React 19, TypeScript, Tailwind, Prisma + Postgres.

## Running locally

You need a Postgres database. Easiest is a free one from Vercel or Neon - paste
its connection strings into `.env`.

```bash
npm install
cp .env.example .env      # fill in POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, JWT_SECRET
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

## Deploy (Vercel)

1. Import the repo at vercel.com.
2. In the project, Storage tab -> create a Postgres database and connect it
   (adds `POSTGRES_*` env vars automatically).
3. Add env vars: `JWT_SECRET`, and the `MPESA_*` vars if going live.
4. Deploy. Then push the schema + seed once, from your machine, with the
   Postgres URLs in `.env`:

   ```bash
   npm run db:push
   npm run db:seed
   ```

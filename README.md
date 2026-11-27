# money

A pnpm + Turborepo monorepo for two personal apps, a finance tracker and a
password vault, that share UI and auth packages.

Live (CashGap): https://keep-track-of-your-finances.vercel.app

## Apps

- `apps/cashgap` (CashGap): track income, expenses and subscriptions and see
  the gap between them on a dashboard. Email/password and Google sign-in with
  email verification.
- `apps/secure` (SecureVault): an encrypted password vault. The live version is
  deployed from its own repo (`AmarMuric04/secure`) at https://keep-your-passwords-safe.vercel.app.
- `apps/web`, `apps/docs`: leftover Turborepo starter apps.

## Packages

- `@repo/ui`: shared React components
- `@repo/auth`: shared login/register UI and auth hooks
- `@repo/eslint-config`, `@repo/typescript-config`: shared configs

## Stack

Next.js 16, React 19, TypeScript, MongoDB, NextAuth (CashGap), Tailwind CSS,
Turborepo, pnpm.

## Run locally

```bash
pnpm install
pnpm dev                          # all apps
pnpm dev --filter=cashgap         # one app, http://localhost:3000
pnpm check-types && pnpm lint     # checks
pnpm build
```

## Environment variables (CashGap)

`MONGODB_URI`, `AUTH_SECRET`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL`,
`ALLOWED_ORIGIN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
`SMTP_PASSWORD`, `SMTP_FROM`. See `apps/cashgap/DEPLOYMENT.md` for details.

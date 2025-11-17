# Pragati Frontend

This project boots directly from the landing page generated in v0.dev and copied into the repository root. It is a Next.js 16 app that uses Tailwind CSS v4, Radix UI primitives, and the shadcn/ui component patterns under `components/ui`.

## Project layout

- `app/` – Next.js App Router pages and layouts.
- `components/` – Shared UI elements, including all shadcn-generated primitives (`components/ui`).
- `hooks/` – Reusable React hooks such as `use-mobile` and `use-toast`.
- `styles/` – Global CSS entry points.
- `public/` – Static assets.
- `code/` – Original download from v0.dev kept as a snapshot for reference.

## Getting started

```powershell
pnpm install
pnpm dev
```

The development server runs with `next dev` (default port 3000). Use `pnpm build` for a production build and `pnpm start` to serve the built output. Tailwind CSS classes are compiled through the Next.js 16 PostCSS/Tailwind v4 pipeline as configured in `postcss.config.mjs`.

### Environment variables

Copy `.env.local.example` to `.env.local` and adjust as needed:

```powershell
Copy-Item .env.local.example .env.local
```

- `NEXT_PUBLIC_BACKEND_URL` — API origin for real-time notices (defaults to `http://localhost:4000`). The app automatically calls `/api/communications/notifications/public` relative to this base URL.

The client-side updates section reads these values to fetch announcements.

## Notes

- TypeScript path aliases use the `@/*` pattern defined in `tsconfig.json`.
- `next-env.d.ts` is checked into source control to ensure editors pick up Next.js types immediately.
- Keep the `code/` directory untouched if you want a clean reference to the original landing page export.

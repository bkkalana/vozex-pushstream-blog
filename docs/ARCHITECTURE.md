# Architecture

PushStream uses Next.js App Router with Server Components as the default. Interactive controls are isolated Client Components. Public routes live under `app/(site)`, admin routes under `app/admin`, and HTTP endpoints under `app/api`.

Business logic will follow: route/action -> Zod validation -> service -> repository -> Prisma. Authorization is enforced server-side before mutation. Shared cross-cutting concerns live under `lib/`.

## Main boundaries
- `components/site`: public presentation
- `components/admin`: administration presentation
- `components/editor`: editor-specific UI
- `components/ui`: reusable design primitives
- `services`: business rules/orchestration
- `repositories`: data access
- `lib`: auth, validation, permissions, SEO, analytics, logging, and errors
- `prisma`: relational schema/migrations/seed

## Rendering
Public pages should use server rendering, static generation, ISR/cache components where appropriate. Client JavaScript is added only for interaction.

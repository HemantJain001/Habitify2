# AttackMode — Project Architecture (Standard)

**One rule:** keep the stack boring and the boundaries clear.

```text
Browser
  → middleware.ts          (authenticate: JWT present?)
  → Page / AuthGuard       (UX hydration only)
  → TanStack Query         (server-state cache)
  → /api/* route handler   (requireUser + jsonOk/jsonError)
  → Prisma                 (userId-scoped queries)
  → PostgreSQL
```

---

## Layers (do not invent more)

| Layer | Responsibility | Files |
|-------|----------------|-------|
| **Edge** | Auth gate for pages + data APIs | `src/middleware.ts` |
| **UI** | Render + local UI state | `src/components/*`, `src/app/*/page.tsx` |
| **Client data** | Fetch/cache/invalidate | `src/lib/hooks.ts` → `src/lib/api.ts` |
| **HTTP** | Auth + validate + respond | `src/app/api/**/route.ts` |
| **Shared server** | Session helper, JSON helpers, enums | `src/lib/server/*` |
| **DB** | Persistence | `src/lib/prisma.ts`, `prisma/schema.prisma` |
| **Auth config** | Credentials + JWT callbacks | `src/lib/auth.ts` |
| **AI** | Context assembly + LLM call | `src/lib/ai/*`, `src/lib/deepseek.ts` |

No Controllers/Services/Repos folders yet — route handlers stay thin and call Prisma directly. Extract a service **only** when two routes share non-trivial logic (e.g. streak recompute).

---

## Auth (defense in depth)

1. **`middleware.ts`** — JWT via `getToken`. Pages → redirect. APIs → `401`.
2. **`requireUser()`** — every protected handler; returns `{ user }` or error response.
3. **Ownership** — every query/mutation includes `userId: user.id`.
4. **`AuthGuard`** — spinner while `useSession` hydrates. **Not security.**

Public: `/auth/*`, `/api/auth/*`, `/api/test`, `/interview-prep.html`, `/docs/*`.

---

## API convention

```ts
export async function GET() {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const rows = await prisma.task.findMany({ where: { userId: user.id } })
    return jsonOk({ tasks: rows })
  } catch (err) {
    console.error("...", err)
    return jsonError("Internal server error", 500)
  }
}
```

- Success → `jsonOk(data, status?)`
- Failure → `jsonError(message, status)`
- Power categories → `isPowerCategory()` from `src/lib/server/constants.ts`
- **GET is read-only** (no hidden writes — stats compute in memory)

---

## Data model (simple)

```text
User
 ├── Task
 ├── PowerSystemTodo   (brain | muscle | money)
 ├── JournalEntry      (unique userId + date)
 ├── BehaviorEntry
 ├── ProblemSolvingEntry
 └── UserStats (1:1)
```

PostgreSQL + Prisma. **Not Mongo.** (mongoose removed.)

---

## Client data

- TanStack Query for server state (`hooks.ts`)
- Query keys: `['tasks']`, `['user-stats']`, `['power-system-todos', params]`, …
- Mutations invalidate related keys
- Shell fetches **stats only**; calendar data loads when calendar opens

---

## Explicitly rejected (dumb decisions)

| Decision | Why rejected |
|----------|--------------|
| Client-only AuthGuard as security | Bypassed by scrapers |
| `getServerSession` copy-pasted per route | Drift; use `requireUser` |
| GET `/user/stats` writing DB | GETs must be safe |
| Returning full `session` from profile | Over-exposure |
| Eager journal/power fetch on every page | Waste |
| mongoose in package.json | Unused; confuses story |
| React Query Devtools in production | Bundle noise |
| Duplicate update hooks | One hook, one alias |

---

## What to say in interviews

> “Modular Next.js monolith. Middleware authenticates; route handlers authorize with `requireUser` and user-scoped Prisma. TanStack Query owns client server-state. Postgres is source of truth. AI is fail-soft and never blocks CRUD.”

---

## Next (only when needed)

1. Zod validation on writes  
2. Transactions on task-complete + stats counters  
3. Redis rate limits on auth + AI  
4. Extract `StatsService` if streak logic is shared by workers  

Until then: **don’t add layers for resume aesthetics.**

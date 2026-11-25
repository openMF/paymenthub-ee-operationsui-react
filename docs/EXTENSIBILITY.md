# Extensibility Guide — Payment Hub EE React App

## Overview

This guide explains how to add new feature modules to the Payment Hub EE Operations App. The app follows a feature-based modular architecture: each domain area (Payment Hub, Vouchers, G2P Config, RBAC, Account Mapper, ...) lives under `src/modules/<name>/` as a mostly self-contained unit, with a thin route/page wrapper in `src/pages/` and an entry in the router and sidebar.

This is a living document describing the *current* codebase conventions, not an aspirational architecture. Where the codebase is inconsistent or a piece of plumbing exists but isn't actually used yet, that's called out explicitly rather than glossed over — copying an unused pattern into a new module is worse than knowing it's unused.

## Module Structure

Every existing module (`payment-hub`, `g2p-config`, `vouchers`, `rbac`, `account-mapper`) follows this shape:

```
src/modules/<module-name>/
├── types.ts                 # TypeScript interfaces for this domain
├── <ModuleName>.tsx         # Main page component — breadcrumb + title + Tabs
└── <Something>Tab.tsx       # One component per tab (e.g. MainBatchesTab.tsx)
```

Modules don't carry mock data. Dev-server sample data, if a module has any, lives in `src/mocks/` (see [MOCK-DATA.md](MOCK-DATA.md)).

Notes on what's real vs. aspirational here:

- **No module has an `index.ts` barrel export.** Every import goes straight to the file, e.g. `import MainBatchesTab from './MainBatchesTab'`. Don't add barrel files unless you're deliberately introducing that convention project-wide — a lone barrel in one module would be inconsistent with everything else.
- The module folder is kebab-case (`g2p-config`, `account-mapper`); the main page component inside is PascalCase without the hyphen (`G2PConfig.tsx`, `AccountMapper.tsx`).
- Not every module is tab-only. `payment-hub` also has `BatchDetail.tsx`, a drill-down page routed separately (`payment-hub/batch/:batchId`) rather than a tab — it's fine for a module to have pages beyond its tab set.
- `src/pages/<Name>.tsx` files are thin re-exports, e.g. `src/pages/PaymentHub.tsx` is just `export { default } from '@/modules/payment-hub/PaymentHub'`. The router imports from `src/pages/`, never directly from `src/modules/`.

## Step-by-Step: Adding a New Module

### Step 1 — Define Types

Create `src/modules/<name>/types.ts` with the interfaces for your domain's data shape. Match the field names and types your backend actually returns — including nullability. Existing modules model backend nulls explicitly rather than assuming fields are always present, e.g. `MainBatch.status: string | null` in `src/modules/payment-hub/types.ts`. Do the same for your module: if a field can come back `null` from the API, type it as `T | null`, not `T`.

### Step 2 — Sample Data for the Dev Server (optional)

If you want to work on the screen before its endpoint exists, or without a backend, add sample data and an MSW handler under `src/mocks/` (steps in [MOCK-DATA.md](MOCK-DATA.md#adding-sample-data)). The screen itself never imports it: it is served only by the dev server, only with `VITE_ENABLE_MSW=true`.

### Step 3 — Create API Function

Add `src/lib/api/<name>.ts`. Decide whether your module talks to the **existing backend** (reuse the shared `apiClient` from `src/lib/api/client.ts`, which already sends the `Platform-TenantId` and `Authorization` headers, and on a 401 refreshes the token and retries before sending the user to login) or a **different backend service** (create your own `axios.create({...})` instance in this file, following the pattern in `src/lib/api/g2pConfig.ts`, and attach `createAuthInterceptors()` to it for the tenant and token headers).

There's no shared client factory: each `lib/api/<name>.ts` file calls `axios.create()` itself if it needs its own instance, and shares the interceptors through `createAuthInterceptors()` (`src/lib/api/authInterceptors.ts`). See the "Environment Variables" section below for naming the base URL.

### Step 4 — Build the UI Component

Create `src/modules/<name>/<ModuleName>.tsx` as the main page: breadcrumb nav, `<h1>` title, and a shadcn `Tabs` block if the module has more than one view. Create one `<Something>Tab.tsx` per tab. Wire data fetching per the TanStack Query pattern in the "API Integration Pattern" section below.

### Step 5 — Add Route

In `src/main.tsx`, create `src/pages/<ModuleName>.tsx` as a re-export (`export { default } from '@/modules/<name>/<ModuleName>'`), import it, and add `{ path: '<name>', element: <ModuleName /> }` to the `children` array under the `AppLayout` route. This gives you the sidebar chrome and Keycloak-protected auth automatically. If the page must be public (no login required), add it to the top-level public route array instead — see how `account-mapper/self-service` is registered outside `AuthRoot`.

### Step 6 — Add to Sidebar Navigation

In `src/components/shared/AppLayout.tsx`, add an entry to the `navItems` array:

```ts
{ label: 'Notifications', path: '/notifications', icon: Bell },
```

Import the icon from `lucide-react`. The `path` must exactly match what you registered in `main.tsx` — the app currently has one stale sidebar entry (`Audit Trails` → `/audit`) whose route was never registered, so it silently 404s. Don't repeat that mistake; add the route in the same change as the nav entry.

### Step 7 — Add to Dashboard (optional)

There is **no generic "every module gets a dashboard card" mechanism** — `src/pages/Dashboard.tsx`'s four `StatCard`s are all Payment-Hub-specific numbers computed from one `useQuery(['mainBatches'], fetchMainBatches)` call, not one query per module. If you want your new module represented on the dashboard, you have two real options, both manual:

- Add a `StatCard` to the existing `grid-cols-4` grid (you'll likely need to widen the grid, e.g. `grid-cols-5`), backed by your own `useQuery` call and a summary number you compute.
- Add a button to the "Quick Actions" card at the bottom of the dashboard that navigates to your module — this is the more common pattern for surfacing a module without inventing a new metric.

Don't invent a "cards registry" or config-driven dashboard — it doesn't exist today, and hand-rolling one for a single module addition is scope creep.

### Step 8 — Wire to Real API

Fetch with TanStack Query as described in the "API Integration Pattern" section below. Until a backend exists, the screen shows `NotAvailable` (as vouchers and User Management do), not invented rows.

## Example — Adding a "Notifications" Module

This walks through a complete, minimal module end to end.

**1. `src/modules/notifications/types.ts`**

```ts
export interface Notification {
  id: number
  title: string
  message: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  createdAt: number | null
  readAt: number | null
}
```

**2. `src/lib/api/notifications.ts`**

```ts
import apiClient from './client'

export const fetchNotifications = async () => {
  const response = await apiClient.get('/notifications')
  return response.data
}
```

(This assumes notifications live on the same backend as Payment Hub, hence reusing `apiClient`. If it's a separate service, follow the `g2pConfig.ts` pattern instead — see Step 3.)

**3. `src/modules/notifications/NotificationsTab.tsx`**

```tsx
import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '@/lib/api/notifications'
import type { Notification } from './types'
import StatusBadge from '@/components/shared/StatusBadge'
import LoadError from '@/components/shared/LoadError'
import { formatTime } from '@/lib/formatTime'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const SKELETON_ROWS = 5

export default function NotificationsTab() {
  const { data: apiData, isLoading, isError, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  // No rows of our own: an error shows LoadError, an empty answer shows the empty state.
  const rows: Notification[] = apiData ?? []

  return (
    <div className="space-y-4">
      {isError && <LoadError what="notifications" error={error} />}

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 rounded bg-gray-100 animate-pulse w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {isError ? 'No notifications loaded.' : 'No records found.'}
                    </TableCell>
                  </TableRow>
                )
                : rows.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell>{n.message}</TableCell>
                    <TableCell>{formatTime(n.createdAt)}</TableCell>
                    <TableCell><StatusBadge status={n.severity} /></TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

**4. `src/modules/notifications/Notifications.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import NotificationsTab from './NotificationsTab'

export default function Notifications() {
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Notifications</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>

      <Tabs defaultValue="notifications">
        <TabsList variant="line">
          <TabsTrigger value="notifications">All Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**5. `src/pages/Notifications.tsx`**

```ts
export { default } from '@/modules/notifications/Notifications'
```

**6. `src/main.tsx`** — add the import and route:

```tsx
import Notifications from '@/pages/Notifications'
// ...
{ path: 'notifications', element: <Notifications /> },
```

**7. `src/components/shared/AppLayout.tsx`** — add the sidebar entry:

```ts
import { Bell } from 'lucide-react'
// ...
{ label: 'Notifications', path: '/notifications', icon: Bell },
```

That's a complete, routable module. With no backend it shows the error from `fetchNotifications`. To work on it without a backend, add sample data on the dev server (Step 2).

## API Integration Pattern

Every data-fetching screen uses TanStack Query and shows one of five states, as `MainBatchesTab.tsx` and `Dashboard.tsx` do:

```tsx
const { data: apiData, isLoading, isError, error } = useQuery({
  queryKey: ['mainBatches'],
  queryFn: fetchMainBatches,
})

const rows: MainBatch[] = apiData?.data ?? []

{isError && <LoadError what="batches" error={error} />}
// in the table body: skeleton while isLoading; 'No records found.' when rows is empty
```

| State | Show |
|---|---|
| Loading | A skeleton: pulsing `<div>`s matching the table's column count (`SKELETON_ROWS`), not a spinner |
| Data | The rows |
| Empty answer | "No records found." (or "No … loaded." when the call failed) |
| Error | `LoadError` (`src/components/shared/LoadError.tsx`): `Could not load <what>: <HTTP status or message>`, and no rows |
| No backend yet | `NotAvailable` from the same file: `<what> not available: Payment Hub has no backend for this yet` |

Rules, all from bugs this codebase has had:

- **Never substitute rows of your own,** not on an error and not on an empty answer. Earlier versions showed bundled mock rows under "showing cached data" when a call failed, and before that whenever the answer was empty. Real faults (a 401, a wrong URL) looked like working screens. `noMockFallback.test.tsx` checks the payment-hub screens for this.
- **A write that fails reports failure.** Use the mutation's error (`useMutation`'s `onError`, or let the API function throw); never show a success message the backend didn't confirm.
- **Format amounts and times** with `formatAmount()` and `formatTime()`.

## StatusBadge Extension

`src/components/shared/StatusBadge.tsx` renders any status string as a colored pill. To support a new status value, add a key to its flat `statusStyles` map:

```ts
const statusStyles: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  // ...
  YourNewStatus: 'bg-indigo-100 text-indigo-700',
}
```

Things to know before adding a key:

- **Keys are matched verbatim against whatever string the backend/mock emits — there's no case normalization.** The map already carries both `Completed` and `COMPLETED` as separate entries because two different backends emit different casing for conceptually the same status. If your new status might come back in more than one casing, add both keys rather than assuming the component will normalize it for you.
- Any status not present in the map falls back to gray (`bg-gray-100 text-gray-600`) rather than erroring — a missing key is a silent visual bug (wrong/no color), not a crash, so double-check the exact string your API returns.
- The component takes an optional `label` prop to show different text than the lookup key — useful when you want to look up styling for one string but display another. See `G2PPaymentTab.tsx`, which passes `status={config.status === 'Inactive' ? 'Inactive-G2P' : config.status}` with `label={config.status}` so "Inactive" G2P configs render in red instead of the generic gray "Inactive" color, while still displaying the word "Inactive" to the user.
- `status` accepts `string | null | undefined` — passing `null`/`undefined` renders a plain gray `-` pill rather than crashing, so you don't need to guard against nullable status fields before passing them in.

## Environment Variables

New backend service URLs follow the naming convention `VITE_<SERVICE_NAME>_URL` — all-caps snake case, `VITE_` prefix (required by Vite to expose a variable to client-side code), `_URL` suffix. Existing examples: `VITE_API_BASE_URL`, `VITE_G2P_SERVICE_URL`, `VITE_BULK_CONNECTOR_URL`.

To add one:

1. Add the key (with a value) to your local env file (`.env.development` or `.env.g2p`).
2. Add the same key (blank) to `.env.example` so other developers know it's needed.
3. Read it with `getEnv('VITE_YOUR_SERVICE_URL')` (`src/lib/runtime-config.ts`) in your `src/lib/api/<name>.ts` file. See `g2pConfig.ts`'s `axios.create({ baseURL: getEnv('VITE_G2P_SERVICE_URL') || 'http://localhost:8084' })`, including a local-dev fallback default.
4. Add it to `docker/docker-entrypoint.sh`, so a deployment can set it at container start without a rebuild.

There is **no `vite-env.d.ts` with a typed `ImportMetaEnv` interface** in this repo — env var access is untyped (effectively `string | undefined`), and TypeScript won't catch a typo'd variable name or a missing one at compile time. If you're adding several new env vars for a large module, consider adding a `vite-env.d.ts` with a typed `ImportMetaEnv` as a small standalone improvement — but that's a repo-wide change, not something to bolt on silently as part of one module's PR.

## Keycloak RBAC

**Be aware before you rely on this: `hasRole` exists but nothing in the app currently uses it to gate anything.** `useAuth()` (`src/lib/keycloak/useAuth.ts`) returns:

```ts
interface UseAuthReturn {
  authenticated: boolean
  token: string | undefined
  user: AuthUser | null
  logout: () => void
  hasRole: (role: string) => boolean
}
```

`hasRole(role)` checks `keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role)`. Today, the only real call site of `useAuth()` in the whole app is `AppLayout.tsx`, and it only destructures `user`/`logout` — to show the avatar name and wire the sign-out button. No route, page, or tab currently checks `hasRole` for anything; every authenticated user sees every route and every action.

If your new module needs role-gated UI or routes, you're the first to actually wire this up — do it deliberately rather than assuming there's an established pattern to copy. Two straightforward approaches, consistent with how the rest of the app is structured:

**Gate a whole route** — wrap the element in `main.tsx`, or add a guard component:

```tsx
function RequireRole({ role, children }: { role: string; children: React.ReactNode }) {
  const { hasRole } = useAuth()
  if (!hasRole(role)) return <Navigate to="/" replace />
  return <>{children}</>
}

// in the route config:
{ path: 'notifications', element: <RequireRole role="notifications-admin"><Notifications /></RequireRole> },
```

**Gate a piece of UI** — conditionally render inside a component:

```tsx
const { hasRole } = useAuth()

{hasRole('notifications-admin') && (
  <Button onClick={handleDelete}>Delete Notification</Button>
)}
```

Whichever you pick, name the Keycloak role clearly and confirm with whoever owns the Keycloak realm config that the role actually exists there — `hasRole` will just silently return `false` for a role that was never created, which looks identical to "user correctly lacks permission" from the UI's perspective.

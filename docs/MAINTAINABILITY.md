# Maintainability Guide

This document covers how the codebase is kept consistent day to day: conventions, review process, dependency hygiene, and — honestly — where the project currently has no tooling at all. Where something doesn't exist yet, it says so, rather than describing an aspirational setup that would mislead a new contributor into thinking it's already there.

## Code Conventions

- **Language/tooling:** React 19 + TypeScript ~6.0, built with Vite (`tsc -b && vite build`). Routing via `react-router-dom` v7 (`createBrowserRouter`). Server state via `@tanstack/react-query` v5. Styling via Tailwind CSS v4 (Vite plugin form, not a PostCSS config file) plus shadcn/Radix UI primitives under `src/components/ui/`.
- **Module layout:** feature-based, under `src/modules/<name>/` — see `docs/EXTENSIBILITY.md` for the full shape and step-by-step for adding a new one. `src/pages/<Name>.tsx` files are thin re-exports consumed by the router; don't put real logic there.
- **No barrel exports.** No module has an `index.ts` — import directly from the file (`import MainBatchesTab from './MainBatchesTab'`). Don't introduce one in a single module; it'd be inconsistent with every other module in the repo.
- **Nullability:** model backend nulls explicitly in `types.ts` (`status: string | null`, not `status: string`), and handle `null`/`undefined` at render time rather than assuming a field is always populated. Several past bugs in this codebase were exactly this: treating an optional field as always-present.
- **Status colors:** all status→color mapping goes through the shared `StatusBadge` component (`src/components/shared/StatusBadge.tsx`) and its `statusStyles` map — don't hand-roll a new colored-pill component for a new status set.
- **Data fetching:** TanStack Query + `isError`-gated mock fallback, described in `docs/EXTENSIBILITY.md`'s "API Integration Pattern" section. Don't fall back to mock data on an empty successful response — only on an actual fetch error.
- **Formatting:** there is **no Prettier** in this repo — no `.prettierrc*`, no `prettier` dependency. Formatting is whatever your editor does plus ESLint's opinions; match the surrounding file's style (2-space indent, no semicolons, single quotes) since that's the prevailing convention throughout `src/`, even though nothing enforces it automatically.

## PR Process

There is no formal, written PR template or required-reviewer policy encoded in this repo (no `.github/PULL_REQUEST_TEMPLATE.md`, no CODEOWNERS). In practice:

- Keep PRs scoped to one module or one cross-cutting concern (e.g. "wire Payment Hub to real API" as its own PR, not bundled with an unrelated RBAC change).
- Run `npm run build` locally before opening a PR — it runs `tsc -b` first, so a broken build catches type errors that `npm run dev` (plain `vite`, no type-checking) won't surface. `vite dev` will happily serve a file with type errors; only `build` (or a manual `tsc --noEmit`) actually checks types.
- Run `npm run lint` and fix what it flags before requesting review — see the "Adding Dependencies" section for what's actually configured.
- If you're the reviewer and see feedback with fabricated specifics (a function name, a field that supposedly exists, an "as the PR description says" claim) — verify it against the actual code before accepting it. Several past review cycles on this project caught reviewer suggestions that referenced field names or endpoint shapes that didn't match what the code actually had.

## Adding Dependencies

- Lint: ESLint only, flat config at `eslint.config.js` — `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-react-hooks` (flat recommended) + `eslint-plugin-react-refresh` (Vite variant). Run via `npm run lint`.
- No Prettier, no Stylelint, no commit hooks (no Husky/lint-staged config present) — nothing blocks a commit or push based on lint/format state today. Don't assume a pre-commit hook will catch what you didn't check yourself.
- Before adding a new package, check whether an existing dependency already covers the need — this app already carries `axios`, `@tanstack/react-query`, `recharts` (charts), `jspdf`/`jspdf-autotable` (PDF export), `lucide-react` (icons), `class-variance-authority`/`clsx`/`tailwind-merge` (styling utilities), and the full `radix-ui` primitive set via shadcn. A new charting, icon, or PDF library is very unlikely to be justified.
- When you do add something, prefer a scoped, actively maintained package over a kitchen-sink framework, and add it to the correct `dependencies`/`devDependencies` bucket — build-only tooling (test runners, type stubs) belongs in `devDependencies`; anything imported by app code at runtime belongs in `dependencies`.
- `msw` (Mock Service Worker) is already a devDependency, but currently wired only for **dev-mode API mocking** (`enableMocking()` in `main.tsx`, gated on `import.meta.env.DEV`) — not for tests, since there are no tests yet (see below). If you use MSW handlers for a new module, add them under `src/mocks/handlers/` following the existing `g2p.handlers.ts` pattern and register them in `src/mocks/browser.ts`.

## Testing Approach

**There is currently no automated testing in this repository.** No test runner is configured (no Vitest, no Jest — no config file for either, no `test` script in `package.json`), no `*.test.tsx`/`*.spec.tsx` files exist anywhere in `src/`, and no testing-library packages are installed.

This means:

- Correctness today is verified by `tsc -b` (type checking), `npm run lint` (ESLint), a manual `npm run build`, and manual/visual verification in the browser. That's a real gap, not a stopgap for something more rigorous — treat "I ran the build and it compiled" as necessary but not sufficient evidence a change works.
- If you're introducing non-trivial logic (a data-transform function, a status/rate calculation, a date-grouping helper), consider whether this is the PR to also introduce Vitest — it's the natural fit given the Vite toolchain already in place, and would need: `vitest` + `@testing-library/react` + `@testing-library/jest-dom` as devDependencies, a `vitest.config.ts` (or a `test` block in `vite.config.ts`), and a `"test": "vitest"` script. Don't do this silently as a side effect of an unrelated feature PR — it's a repo-wide decision worth its own PR and sign-off.
- Until then, manually exercise: the happy path, the loading-skeleton state, the `isError` fallback-to-mock state, and the empty-result state, for any component you touch that fetches data. These four states are exactly where this codebase's past bugs have clustered (see the git history around the `isError`-vs-empty-array fallback fix across several tabs).

## Environment Configuration

- Env vars are Vite-standard: `VITE_`-prefixed to be exposed to client code, read via `import.meta.env.VITE_X`. See `.env.example` for the current full list (`VITE_API_BASE_URL`, `VITE_BULK_CONNECTOR_URL`, `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`, `VITE_TENANT_ID`, `VITE_G2P_SERVICE_URL`).
- **No typed `ImportMetaEnv`** — there's no `vite-env.d.ts` augmenting the env var types, so a typo'd or missing `VITE_*` reference won't be caught by TypeScript; it'll just resolve to `undefined` at runtime. Double-check env var names by hand when adding or renaming one.
- Whenever you add a new env var, update **both** `.env` (your local value, gitignored) and `.env.example` (blank placeholder, committed) — a var only in `.env` means every other developer's checkout silently lacks it with no error, just a broken feature.
- Multi-tenancy: the app reads a `tenant` value from `localStorage` (defaulting to `greenbank`), sent as a `Platform-TenantId` header by the shared `apiClient`'s request interceptor (`src/lib/api/client.ts`). If your module's backend is tenant-scoped and you're using the shared `apiClient`, this is handled for you automatically; if you create a separate axios instance (see `g2pConfig.ts`), you'd need to add the same header yourself if that backend also needs it.

## Mock Data Strategy

Every module ships hand-written mock data under `src/modules/<name>/mocks/`, typed against that module's `types.ts`. This mock data is not disposable scaffolding — it's the fallback rendered whenever a `useQuery` call fails (`isError === true`), so it's part of the shipped UX for "backend is down," not just a development convenience.

Keep in mind:

- Mock data must stay in sync with the type it's typed against — a stale mock missing a newly required field is a compile error waiting to be silenced with an `any` cast; fix the mock, don't cast around it.
- Mock data should be realistic enough to exercise pagination, filtering, and empty/edge-case states — several existing mocks (e.g. `mainBatches.mock.ts`) deliberately include a spread of statuses and null fields for exactly this reason.
- When a real endpoint's response shape differs from what was assumed when the mock was written, the mock needs to be corrected to match reality — this has happened repeatedly during the Payment Hub API integration (mock fields renamed from `batchReferenceNumber`/`sourceMinistry`/etc. to the real `batchId`/`payerFsp`/etc.), and a stale mock silently misleads anyone hitting the fallback path.
- MSW handlers (`src/mocks/handlers/`) are a second, separate mock layer used only in dev mode to intercept actual HTTP calls before they leave the browser — currently used for the G2P Config module (`localhost:8084` endpoints not yet deployed). Use this when you need to develop against an endpoint that doesn't exist yet at all, as opposed to the `isError`-fallback mock, which is for when a real endpoint exists but might be unreachable.

## API Integration Checklist

When wiring a module to a real backend (Step 8 in `docs/EXTENSIBILITY.md`), work through this list:

- [ ] Confirm the **actual** response shape against a real payload (or a teammate's sample JSON) — don't assume field names/casing from a spec or a PR description; those have been wrong before in this codebase (e.g. an assumed `size: 50` that turned out to not match what was actually implemented, and several assumed field names that didn't match the real Gazelle API).
- [ ] Update `types.ts` to match the verified real shape, including nullability.
- [ ] Update the mock data to match the same shape, so the `isError` fallback path stays truthful.
- [ ] Confirm the fallback condition is `isError ? mock : (data ?? [])`, not `data?.length ? data : mock` — the latter masks legitimate empty results as errors.
- [ ] Confirm `StatusBadge` has entries for every real status string your endpoint can return, in the exact casing the backend sends (`COMPLETED` vs `Completed` are different keys).
- [ ] If amounts come back as minor-unit integers or as signed strings (seen in the Transfers endpoint), confirm the display formatting (`Math.abs(amount / 100).toLocaleString()`) matches what the backend actually does, rather than assuming major-unit floats.
- [ ] Confirm date/timestamp fields are epoch milliseconds vs. ISO strings vs. epoch seconds before formatting — this codebase has both `startedAt: number` (epoch ms) and `startTime: string` (ISO-ish) fields across different modules; don't assume one format based on a field's name alone.
- [ ] Verify loading skeleton, error banner, and empty state all render correctly by temporarily forcing each condition (e.g. point `VITE_*_URL` at an invalid host to force `isError`).

## Known Limitations

Documenting these plainly so they're treated as known debt rather than rediscovered as surprises:

- **No automated tests.** See "Testing Approach" above.
- **No RBAC enforcement.** `useAuth().hasRole` exists but is not called anywhere except its own definition — every authenticated user can reach every route and action regardless of their Keycloak role. See `docs/EXTENSIBILITY.md`'s "Keycloak RBAC" section if you need to actually gate something.
- **Dead sidebar link.** `AppLayout.tsx`'s `navItems` includes "Audit Trails" pointing at `/audit`, which is not registered in `src/main.tsx` — clicking it renders the catch-all `NotFound` page. Either register the route or remove the nav entry.
- **Duplicate sidebar targets.** "Users" and "Roles & Permissions" both link to `/rbac` — there's a single RBAC page with tabs, but two separate nav entries pointing at the same URL rather than one entry, or two entries deep-linking to specific tabs.
- **No typed environment variables.** See "Environment Configuration" above — a mistyped `VITE_*` name fails silently at runtime, not at compile time.
- **Inconsistent module data conventions across the codebase's history.** Some modules were built against assumed API shapes that didn't match the real backend and needed multiple follow-up corrections once real payloads were available (field renames, status-casing fixes, amount/unit fixes). When extending an existing module, don't assume its current `types.ts` is necessarily final — verify against a live payload if one is available.
- **Large production bundle.** The Vite build currently warns about a >500kB chunk (`recharts`, `jspdf`/`jspdf-autotable`, and the shadcn/Radix set are the likely bulk). No code-splitting has been set up yet; if bundle size becomes a real problem, look at `build.rolldownOptions.output.codeSplitting` or route-level `React.lazy()` before reaching for a different charting/PDF library.

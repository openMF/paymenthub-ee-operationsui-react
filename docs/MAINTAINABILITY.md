# Maintainability Guide

This document covers how the codebase is kept consistent day to day: conventions, review process, dependency hygiene, and — honestly — where the project currently has no tooling at all. Where something doesn't exist yet, it says so, rather than describing an aspirational setup that would mislead a new contributor into thinking it's already there.

## Code Conventions

- **Language/tooling:** React 19 + TypeScript ~6.0, built with Vite (`tsc -b && vite build`). Routing via `react-router-dom` v7 (`createBrowserRouter`). Server state via `@tanstack/react-query` v5. Styling via Tailwind CSS v4 (Vite plugin form, not a PostCSS config file) plus shadcn/Radix UI primitives under `src/components/ui/`.
- **Module layout:** feature-based, under `src/modules/<name>/` — see `docs/EXTENSIBILITY.md` for the full shape and step-by-step for adding a new one. `src/pages/<Name>.tsx` files are thin re-exports consumed by the router; don't put real logic there.
- **No barrel exports.** No module has an `index.ts` — import directly from the file (`import MainBatchesTab from './MainBatchesTab'`). Don't introduce one in a single module; it'd be inconsistent with every other module in the repo.
- **Nullability:** model backend nulls explicitly in `types.ts` (`status: string | null`, not `status: string`), and handle `null`/`undefined` at render time rather than assuming a field is always populated. Several past bugs in this codebase were exactly this: treating an optional field as always-present.
- **Status colors:** all status→color mapping goes through the shared `StatusBadge` component (`src/components/shared/StatusBadge.tsx`) and its `statusStyles` map — don't hand-roll a new colored-pill component for a new status set.
- **Data fetching:** TanStack Query, with the four states described in `docs/EXTENSIBILITY.md`'s "API Integration Pattern" section: data, empty, error (`LoadError`), not available (`NotAvailable`). Screens never show sample data in place of Payment Hub's: not on an error, not on an empty answer, not for a screen with no backend. See [MOCK-DATA.md](MOCK-DATA.md).
- **Amounts and times:** format amounts with `formatAmount()` (`src/lib/formatAmount.ts`: shown as Payment Hub returns them, with their sign and the currency's decimal places) and times with `formatTime()` / `withTimeZone()` (`src/lib/formatTime.ts`). Don't divide amounts by 100 or drop their sign.
- **Formatting:** there is **no Prettier** in this repo — no `.prettierrc*`, no `prettier` dependency. Formatting is whatever your editor does plus ESLint's opinions; match the surrounding file's style (2-space indent, no semicolons, single quotes) since that's the prevailing convention throughout `src/`, even though nothing enforces it automatically.

## PR Process

There is no formal, written PR template or required-reviewer policy encoded in this repo (no `.github/PULL_REQUEST_TEMPLATE.md`, no CODEOWNERS). In practice:

- Keep PRs scoped to one module or one cross-cutting concern (e.g. "wire Payment Hub to real API" as its own PR, not bundled with an unrelated RBAC change).
- Run `npm run build` locally before opening a PR — it runs `tsc -b` first, so a broken build catches type errors that `npm run dev` (plain `vite`, no type-checking) won't surface. `vite dev` will happily serve a file with type errors; only `build` (or a manual `tsc --noEmit`) actually checks types.
- Run `npm test -- --run` and `npm run build && npm run check:no-mock-data`. CircleCI runs the tests, and the image build runs the build and the check.
- Run `npm run lint` before requesting review. Nothing runs it automatically, and `dev` has 13 problems (11 errors, 2 warnings) that predate CI, so check that your change adds none rather than expecting a clean run. See the "Adding Dependencies" section for what's configured.
- If you're the reviewer and see feedback with fabricated specifics (a function name, a field that supposedly exists, an "as the PR description says" claim) — verify it against the actual code before accepting it. Several past review cycles on this project caught reviewer suggestions that referenced field names or endpoint shapes that didn't match what the code actually had.

## Adding Dependencies

- Lint: ESLint only, flat config at `eslint.config.js` — `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-react-hooks` (flat recommended) + `eslint-plugin-react-refresh` (Vite variant). Run via `npm run lint`.
- No Prettier, no Stylelint, no commit hooks (no Husky/lint-staged config present) — nothing blocks a commit or push based on lint/format state today. Don't assume a pre-commit hook will catch what you didn't check yourself.
- Before adding a new package, check whether an existing dependency already covers the need — this app already carries `axios`, `@tanstack/react-query`, `recharts` (charts), `jspdf`/`jspdf-autotable` (PDF export), `lucide-react` (icons), `class-variance-authority`/`clsx`/`tailwind-merge` (styling utilities), and the full `radix-ui` primitive set via shadcn. A new charting, icon, or PDF library is very unlikely to be justified.
- When you do add something, prefer a scoped, actively maintained package over a kitchen-sink framework, and add it to the correct `dependencies`/`devDependencies` bucket — build-only tooling (test runners, type stubs) belongs in `devDependencies`; anything imported by app code at runtime belongs in `dependencies`.
- `msw` (Mock Service Worker) is a devDependency, used two ways: dev-server mock data (`enableMocking()` in `main.tsx`, only when `import.meta.env.DEV` and `VITE_ENABLE_MSW=true`), and `msw/node` in tests. How to add sample data is in [MOCK-DATA.md](MOCK-DATA.md#adding-sample-data).

## Testing Approach

Tests run on **Vitest** (`vite.config.ts` `test` block: jsdom, globals, `src/test/setup.ts` loads `@testing-library/jest-dom`), with React Testing Library and `msw/node`. Test files sit next to the code as `*.test.ts(x)`. CircleCI (`.circleci/config.yml`) runs `npx tsc --noEmit` and the tests before it builds the Docker image; the image build runs `npm run build` and `npm run check:no-mock-data`. `.github/workflows/ci.yml` has the same steps but runs only when started by hand.

```bash
npm test             # watch mode
npm test -- --run    # once, as CircleCI does
npm run test:coverage
```

What is covered today (13 files, 63 tests): amount, time and CSV formatting; the Keycloak token refresh, idle timer and auth interceptors; the account-mapper API calls; `StatusBadge`; `LoadError`; the payment-hub types; and `noMockFallback.test.tsx`, which checks that a failed call shows the error and no sample rows, and that an empty answer shows "No records found." Most screens have no component test.

For any component you touch that fetches data, test or at least check by hand its four states: loading skeleton, data, empty result, and error (`LoadError`). These are where this codebase's past bugs clustered. A test can set up the API's answer with `vi.mock()` of the API module (as `noMockFallback.test.tsx` does) or with an `msw/node` server (as `accountMapper.test.ts` does).

## Environment Configuration

- Env vars are Vite-standard: `VITE_`-prefixed to be exposed to client code. See `.env.example` for the full list. Read deployment settings (URLs, Keycloak) with `getEnv('VITE_X')` from `src/lib/runtime-config.ts`, not `import.meta.env.VITE_X`. `getEnv` prefers the value the Docker image writes into `env-config.js` at container start, so one image works for any deployment. Add a new runtime key to `docker/docker-entrypoint.sh` too.
- `VITE_ENABLE_MSW` is the exception: `main.tsx` reads it from `import.meta.env`, and only on the dev server, so a deployed image can't turn mock data on. `VITE_TENANT_ID` and `VITE_BULK_CONNECTOR_URL` are in `.env.example` and the entrypoint but no code reads them yet.
- **No typed `ImportMetaEnv`** — there's no `vite-env.d.ts` augmenting the env var types, so a typo'd or missing `VITE_*` reference won't be caught by TypeScript; it'll just resolve to `undefined` at runtime. Double-check env var names by hand when adding or renaming one.
- Whenever you add a new env var, update **both** your local env file (`.env.development` or `.env.g2p`, gitignored) and `.env.example` (committed) — a var only in `.env` means every other developer's checkout silently lacks it with no error, just a broken feature.
- Multi-tenancy: the app reads a `tenant` value from `localStorage` (defaulting to `greenbank`), set from the login screen, the header or Settings, and sends it as a `Platform-TenantId` header from the shared request interceptor (`createAuthInterceptors()` in `src/lib/api/authInterceptors.ts`, used by `client.ts` and `g2pConfig.ts`). If your module's backend is tenant-scoped and you're using the shared `apiClient`, this is handled for you automatically; if you create a separate axios instance, attach `createAuthInterceptors()` to it as `g2pConfig.ts` does.

## Mock Data Strategy

Screens never show sample data in place of Payment Hub's (PHEE-468). Sample data lives only in `src/mocks/` (served by MSW on the dev server when `VITE_ENABLE_MSW=true`) and in tests. A production build never contains it, and the image build checks that with `npm run check:no-mock-data`. When, how and what is mocked, and how to add sample data, is in [MOCK-DATA.md](MOCK-DATA.md).

Keep in mind:

- Sample data must stay in sync with the type it's typed against. A stale mock missing a newly required field is a compile error waiting to be silenced with an `any` cast: fix the mock, don't cast around it.
- Shape it as the real endpoint answers, checked against a real response. This has gone wrong before: mock fields had to be renamed from `batchReferenceNumber`/`sourceMinistry` to the real `batchId`/`payerFsp`, and so on.
- Give it enough variety (statuses, null fields, several pages) to exercise pagination, filters and edge cases while you work on a screen.

## API Integration Checklist

When wiring a module to a real backend (Step 8 in `docs/EXTENSIBILITY.md`), work through this list:

- [ ] Confirm the **actual** response shape against a real payload (or a teammate's sample JSON) — don't assume field names/casing from a spec or a PR description; those have been wrong before in this codebase (e.g. an assumed `size: 50` that turned out to not match what was actually implemented, and several assumed field names that didn't match the real Gazelle API).
- [ ] Update `types.ts` to match the verified real shape, including nullability.
- [ ] If the endpoint has dev-server sample data in `src/mocks/data/`, update it to the same shape.
- [ ] Confirm the screen shows `LoadError` on an error and "No records found." on an empty answer, and never substitutes rows of its own.
- [ ] Confirm `StatusBadge` has entries for every real status string your endpoint can return, in the exact casing the backend sends (`COMPLETED` vs `Completed` are different keys).
- [ ] Format amounts with `formatAmount()`. Payment Hub returns major units, as stored, sometimes as signed strings (Transfers). Don't divide by 100 or take `Math.abs` (PHEE-416 fixed both).
- [ ] Confirm date/timestamp fields are epoch milliseconds vs. ISO strings vs. epoch seconds before formatting — this codebase has both `startedAt: number` (epoch ms) and `startTime: string` (ISO-ish) fields across different modules; don't assume one format based on a field's name alone.
- [ ] Verify the loading skeleton, `LoadError` and empty state all render, in a test or by forcing each condition (for example point `VITE_API_BASE_URL` at an invalid host to force an error).

## Known Limitations

Documenting these plainly so they're treated as known debt rather than rediscovered as surprises:

- **Few component tests.** See "Testing Approach" above.
- **Lint isn't clean or run automatically.** 13 problems on `dev`; see "PR Process".
- **Settings saves nothing.** Its Save buttons show "Settings saved successfully" but store no value.
- **Role cards are fixed text.** RBAC's Role Configuration cards are defined in `RoleConfigTab.tsx`, not read from Keycloak, and not enforced (see the next item).
- **Screens with no backend yet:** vouchers (and the Dashboard's recent vouchers), User Management, and Reporting's ministry and DFSP charts show "not available".
- **No RBAC enforcement.** `useAuth().hasRole` exists but is not called anywhere except its own definition — every authenticated user can reach every route and action regardless of their Keycloak role. See `docs/EXTENSIBILITY.md`'s "Keycloak RBAC" section if you need to actually gate something.
- **Dead sidebar link.** `AppLayout.tsx`'s `navItems` includes "Audit Trails" pointing at `/audit`, which is not registered in `src/main.tsx` — clicking it renders the catch-all `NotFound` page. Either register the route or remove the nav entry.
- **Duplicate sidebar targets.** "Users" and "Roles & Permissions" both link to `/rbac` — there's a single RBAC page with tabs, but two separate nav entries pointing at the same URL rather than one entry, or two entries deep-linking to specific tabs.
- **No typed environment variables.** See "Environment Configuration" above — a mistyped `VITE_*` name fails silently at runtime, not at compile time.
- **Inconsistent module data conventions across the codebase's history.** Some modules were built against assumed API shapes that didn't match the real backend and needed multiple follow-up corrections once real payloads were available (field renames, status-casing fixes, amount/unit fixes). When extending an existing module, don't assume its current `types.ts` is necessarily final — verify against a live payload if one is available.
- **Large production bundle.** The Vite build currently warns about a >500kB chunk (`recharts`, `jspdf`/`jspdf-autotable`, and the shadcn/Radix set are the likely bulk). No code-splitting has been set up yet; if bundle size becomes a real problem, look at `build.rolldownOptions.output.codeSplitting` or route-level `React.lazy()` before reaching for a different charting/PDF library.

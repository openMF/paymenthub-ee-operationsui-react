# Mock data

The app never shows sample data in place of Payment Hub's. A screen shows one of four things:

| Situation | What the screen shows |
|---|---|
| The call succeeded and returned rows | Payment Hub's data |
| The call succeeded and returned nothing | An empty state ("No records found.") |
| The call failed | What failed and why, for example `Could not load batches: HTTP 401 Unauthorized`, and no rows (`LoadError` in `src/components/shared/LoadError.tsx`) |
| Payment Hub has no backend for the screen yet | "… not available: Payment Hub has no backend for this yet" (`NotAvailable`, same file) |

A write that fails reports the failure. It never reports success.

Sample data exists for two purposes only: working on the UI with the dev server and no backend, and tests. This page covers both and explains how production builds are kept free of it.

## When mock data is used

Mock data is served by [Mock Service Worker](https://mswjs.io) (MSW). MSW starts only when **both** of these are true (`enableMocking()` in `src/main.tsx`):

1. The app runs on the Vite dev server (`npm run dev` or `npm run dev:g2p`). Vite sets `import.meta.env.DEV` to `true` only there.
2. `VITE_ENABLE_MSW` is `true` when the dev server starts.

| How the app runs | Can mock data appear? |
|---|---|
| `npm run dev` / `npm run dev:g2p` with `VITE_ENABLE_MSW=true` | Yes, for the endpoints listed below |
| `npm run dev` / `npm run dev:g2p` without it | No |
| `npm run build`, `npm run build:g2p`, `vite preview` | No, whatever `VITE_ENABLE_MSW` is set to |
| The Docker image (Gazelle and other deployments) | No. The container's `VITE_ENABLE_MSW` is written into `env-config.js`, but nothing reads it there |
| Tests (`npm test`) | Only the responses each test sets up itself, see [Tests](#tests) |

In a production build `import.meta.env.DEV` is the constant `false`. The bundler therefore removes the `import('./mocks/browser')` call, and none of `src/mocks/` ends up in `dist/`. `npm run check:no-mock-data` checks this in every image build (see [Keeping sample data out of production](#keeping-sample-data-out-of-production)). Built with `--mode g2p` and `VITE_ENABLE_MSW=true`, the bundle still contains no MSW code or sample data (checked 2026-11-25).

`public/mockServiceWorker.js` is copied into every build, because Vite copies all of `public/`. It does nothing unless a page registers it, and a production build never does.

## Turning it on

Set `VITE_ENABLE_MSW=true` in an env file the dev server loads, then restart the dev server. Vite reads env files only at startup.

| Command | Vite mode | Env files loaded (later ones win) |
|---|---|---|
| `npm run dev` | `development` | `.env`, `.env.local`, `.env.development`, `.env.development.local` |
| `npm run dev:g2p` | `g2p` | `.env`, `.env.local`, `.env.g2p`, `.env.g2p.local` |

The `g2p` mode is only a second set of env files. It lets you keep one file pointing at a real backend and one set up for mocks, and switch between them without editing either. `.env.development` and `.env.g2p` are gitignored, so copy them from `.env.example`.

```bash
cp .env.example .env.g2p
# in .env.g2p: VITE_ENABLE_MSW=true, and leave VITE_G2P_SERVICE_URL as http://localhost:8084
npm run dev:g2p
```

A variable set in the shell also works, for example `VITE_ENABLE_MSW=true npm run dev`.

When MSW is running, the browser console shows `[MSW] Mocking enabled.` If it fails to start, the app logs `MSW failed to start:` with the reason, then carries on without mocks.

## What is mocked

MSW is started with `onUnhandledRequest: 'bypass'`: a request no handler matches goes to the real backend.

| Endpoint (handler) | Sample data | Used by |
|---|---|---|
| `GET */batches` (`paymentHub.handlers.ts`) | `src/mocks/data/mainBatches.ts`, 10 batches | Main Batches, Sub Batches, Dashboard, Reporting |
| `GET */transfers` | `src/mocks/data/transfers.ts` | Transfers, Reporting |
| `GET */batch/transactions?batchId=…` | `src/mocks/data/batchTransactions.ts`, keyed by batch id | Batch detail |
| `GET */beneficiaries` | `src/mocks/data/beneficiaries.ts`, returned in account-mapper's shape | Account Mapper list |
| `GET`/`POST http://localhost:8084/g2pPaymentConfig`, `GET …/governmentEntity`, `…/program`, `…/dfsp` (`g2p.handlers.ts`) | inline in the handler | G2P Config |

Things to know:

- **The Payment Hub handlers match any host** (`*/batches`). With MSW on, these four endpoints return sample data even if `VITE_API_BASE_URL` points at a real Gazelle.
- **The G2P handlers match only `http://localhost:8084`**, the default in `src/lib/api/g2pConfig.ts`. If `VITE_G2P_SERVICE_URL` is set to another URL, those requests go there and are not mocked.
- **Not mocked:**
  - beneficiary create and update (`POST`/`PUT /beneficiaries`)
  - the Self Service Portal (`GET /beneficiary/{id}`, `PUT /identityAccountMapper/beneficiary`)
  
  These go to `VITE_API_BASE_URL`. With no backend, they fail and show their error.
- **Vouchers, User Management and the two Reporting charts** show "not available" with or without MSW. Payment Hub has no backend for them, so there is nothing to mock.
- **Login is not mocked.** Every route except `/splash`, `/login` and the Self Service Portal needs a Keycloak login, so mock mode still needs a Keycloak. Use the local one from the README's [Keycloak setup](../README.md#keycloak-setup-local-docker), or any Keycloak with the `paymenthub` realm and the `opsapp` client.

## Tests

Tests don't use the dev-mode worker or `src/mocks/data/`. Each test sets up the responses it needs:

- `msw/node`'s `setupServer()` with per-test handlers, for the API functions (`src/lib/api/accountMapper.test.ts`, `accountMapperSelfService.test.ts`, `authInterceptors.test.ts`).
- `vi.mock()` of an API module, for screens (`src/modules/payment-hub/noMockFallback.test.tsx`). That test also checks that a failed call shows the error, not sample rows, and that an empty answer shows "No records found."

## Adding sample data

1. Put the data in `src/mocks/data/<name>.ts`, typed against the module's `types.ts`. Shape it as the real endpoint answers, checked against a real response. A wrong mock teaches the screen the wrong shape.
2. Serve it from a handler in `src/mocks/handlers/`, and register the handler in `src/mocks/browser.ts`.
3. Add a string that appears only in that data (an id, say) to `MARKERS` in `scripts/check-no-mock-data.mjs`, so the image build fails if it ever reaches a production build.
4. Never import `src/mocks/` from application code. The only import is the dynamic one in `enableMocking()`, which is behind the `DEV` check.

## Keeping sample data out of production

`npm run check:no-mock-data` (`scripts/check-no-mock-data.mjs`) scans the built files for the markers above. It skips `mockServiceWorker.js`, and exits non-zero if it finds a marker. The `Dockerfile` runs it straight after `npm run build`, so an image whose bundle contains a marker fails to build; every image CircleCI publishes is built that way. `.github/workflows/ci.yml` also runs it, but that workflow only runs when started by hand. Run it yourself after a build:

```bash
npm run build && npm run check:no-mock-data
```

It catches sample data that is already marked. Sample data added without a marker isn't caught, so step 3 above matters.

# Payment Hub EE — Operations Web App (React)

[![License](https://img.shields.io/badge/License-MPL--2.0-blue.svg)](LICENSE)

`paymenthub-ee-operationsui-react` is a modern React-based rebuild of the Payment Hub EE Operations App, replacing the legacy Angular frontend. Built as part of **C4GT DMP 2026** under the [Mifos Initiative](https://mifos.org), targeting release **2.1.0 (October 2026)**.

> `dev` is the active development branch, and all PRs target it. `main` holds released versions. See [contributing.md](contributing.md), the [Code of Conduct](CODE_OF_CONDUCT.md) and the [security policy](SECURITY.md).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 (Vite 8) |
| UI | ShadCN UI (Radix Nova) + TailwindCSS v4 |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| HTTP client | Axios |
| Auth | Keycloak JS — ROPC (Direct Grant) flow |
| Charts | Recharts |
| PDF export | jsPDF + jspdf-autotable |

---

## Features

- **Dashboard** — operational overview with KPI stats, recent batches, quick actions (recent vouchers: not available yet)
- **Payment Hub** — Main Batches, Sub Batches, Transfers with status filters, CSV/PDF export
- **Voucher Management** — screens built, but they show "not available": Payment Hub has no voucher backend for them yet
- **Account Mapper** — beneficiary management, create beneficiary form, self-service portal
- **G2P Payment Config** — configuration list and create form
- **RBAC** — role cards (fixed in the code, not read from Keycloak, and not enforced: see [docs/MAINTAINABILITY.md](docs/MAINTAINABILITY.md#known-limitations)); user management shows "not available" (no backend yet)
- **Reporting Dashboard** — Recharts charts and KPI metrics from batches and transfers, failed batch table (the ministry and DFSP charts: not available yet)
- **Settings** — app configuration form with accordion sections. Its Save buttons store nothing yet, although they say "Settings saved successfully"
- **In-app Keycloak authentication** — ROPC flow, token stored in `localStorage`, JWT expiry validation
- **Animated splash screen** — shimmer progress bar, auto-navigates to login

---

## Project Structure

```
src/
├── modules/                  # Feature modules, one per domain area
│   ├── auth/                  # Login page, Splash screen
│   ├── payment-hub/           # Main Batches, Sub Batches, Transfers
│   ├── vouchers/              # Voucher Management (G2P)
│   ├── account-mapper/        # Beneficiary mapping + self-service portal
│   ├── g2p-config/            # G2P Payment Configuration
│   ├── rbac/                  # Role config and user management
│   ├── reporting/             # Reporting dashboard with charts
│   └── settings/              # App settings
├── components/
│   ├── ui/                    # ShadCN UI primitives
│   └── shared/                # AppLayout, StatusBadge
├── lib/
│   ├── api/                   # Axios clients and API functions (paymentHub, accountMapper, g2pConfig, auth interceptors)
│   ├── keycloak/              # KeycloakProvider, useAuth hook, token refresh, idle timer
│   ├── runtime-config.ts      # getEnv(): runtime env-config.js value, else the build-time one
│   ├── formatAmount.ts        # Amounts as returned, with sign and currency decimals
│   ├── formatTime.ts          # Times in the browser's time zone
│   ├── errorText.ts           # Error text for LoadError (HTTP status or message)
│   ├── exportCsv.ts           # CSV download utility
│   └── exportPdf.ts           # PDF download utility (jsPDF)
├── mocks/                     # Dev-server-only MSW handlers and sample data (see docs/MOCK-DATA.md)
├── test/setup.ts              # Vitest setup (jest-dom)
├── pages/                     # Thin re-exports wiring modules to routes, plus Dashboard and NotFound
├── config/                    # Constants (APP_NAME, TENANTS, DEFAULT_TENANT)
├── main.tsx                   # Router setup, QueryClient, KeycloakProvider, MSW start (dev only)
└── index.css                  # Tailwind base layer and theme

root/
├── components.json            # ShadCN CLI config
├── index.html                 # App HTML shell, loads env-config.js
├── public/env-config.js       # Runtime config placeholder; the Docker image rewrites it at start
├── docker/                    # nginx config and the entrypoint that writes env-config.js
├── Dockerfile                 # node:20 build, nginx:1.27 runtime
├── scripts/check-no-mock-data.mjs  # Fails if a build contains sample data
├── .env.example               # Environment variable template
├── .env.development           # npm run dev (gitignored)
├── .env.g2p                   # npm run dev:g2p (gitignored)
└── vite.config.ts             # Vite and Vitest config
```

---

## Prerequisites

- **Node.js 20.19+ or 22.12+** and npm (Vite 8's minimum; CI and the Dockerfile use Node 20)
- **Docker**, for running Keycloak locally
- A **Keycloak** with the `paymenthub` realm and `opsapp` client (local, see below, or a Gazelle's), since every screen except login and the Self Service Portal needs a login
- A **Payment Hub backend**, such as a Mifos Gazelle deployment. Without one, screens show an error, never sample data. To work on the UI with sample data, use the dev server's mock mode: see [docs/MOCK-DATA.md](docs/MOCK-DATA.md)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/openMF/paymenthub-ee-operationsui-react.git

# 2. Move into the project directory
cd paymenthub-ee-operationsui-react

# 3. Install dependencies
npm install

# 4. Copy and configure environment variables
cp .env.example .env.development

# 5. Start the development server
npm run dev
```

Navigate to `http://localhost:5173/` — the app auto-reloads on file changes.

---

## Development Modes

`npm run dev` and `npm run dev:g2p` both start the Vite dev server. They differ only in which env file they load, so you can keep one file pointing at a real backend and one set up for mock data:

| Command | Loads | Typical use |
|---|---|---|
| `npm run dev` | `.env.development` | A real backend, such as Gazelle |
| `npm run dev:g2p` | `.env.g2p` | Mock data, with `VITE_ENABLE_MSW=true` |

```bash
cp .env.example .env.development   # real backend
cp .env.example .env.g2p           # then set VITE_ENABLE_MSW=true
npm run dev:g2p
```

**Mock data** comes only from MSW, on the dev server, and only when `VITE_ENABLE_MSW=true`. It serves sample batches, transfers, batch transactions and beneficiaries, and the G2P Config endpoints at `http://localhost:8084`. Login still needs a real Keycloak. A production build never contains it, whatever the mode or setting. The screens themselves never fall back to sample data: they show Payment Hub's data, an empty state, an error, or "not available". The details, including what is and isn't mocked, are in [docs/MOCK-DATA.md](docs/MOCK-DATA.md).

---

## Environment Variables

Copy `.env.example` to `.env.development` or `.env.g2p` and fill in the values (see [Development Modes](#development-modes)). Vite builds these values into the bundle. The Docker image can override most of them at container start instead (see [Deploying with Docker](#deploying-with-docker)).

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL for the Payment Hub Operations backend (`/api/v1`) |
| `VITE_BULK_CONNECTOR_URL` | Bulk connector URL. Not read by the app yet: voucher upload shows "not available" |
| `VITE_KEYCLOAK_URL` | Keycloak auth server URL (e.g. `http://localhost:8180`) |
| `VITE_KEYCLOAK_REALM` | Keycloak realm (e.g. `paymenthub`) |
| `VITE_KEYCLOAK_CLIENT_ID` | Keycloak client ID (e.g. `opsapp`) |
| `VITE_TENANT_ID` | Not read by the app. The tenant comes from the login screen's or header's choice (stored as `tenant` in `localStorage`), default `greenbank` (`src/config/constants.ts`) |
| `VITE_G2P_SERVICE_URL` | Base URL for the G2P Payment Config backend |
| `VITE_ENABLE_MSW` | `true` starts MSW mock data, on the dev server only. Ignored by builds and by the Docker image. See [docs/MOCK-DATA.md](docs/MOCK-DATA.md) |

---

## Keycloak Setup (Local Docker)

### Quick Setup (Recommended) — Import Realm

If you have the realm export file, start Keycloak with realm pre-loaded:

```powershell
docker run -p 8180:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  -v /absolute/path/to/docs/keycloak/realm-export.json:/opt/keycloak/data/import/realm.json \
  quay.io/keycloak/keycloak:latest \
  start-dev --import-realm
```

Replace `/absolute/path/to/` with your local path.

This skips manual realm/client setup entirely — see [docs/keycloak/README.md](docs/keycloak/README.md) for what the export contains and the test user you still need to create.

### Manual Setup

Run Keycloak locally on port 8180:

```bash
docker run -p 8180:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

Then configure at `http://localhost:8180`:

1. Create realm: `paymenthub`
2. Create client: `opsapp`
   - **Client authentication:** OFF
   - **Direct access grants:** ON
   - **Valid redirect URIs:** `http://localhost:5173/*`
   - **Web origins:** `http://localhost:5173`
3. Create a test user and set credentials

### Environment Variables

Update `.env.development` (or `.env.g2p`):

```env
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=paymenthub
VITE_KEYCLOAK_CLIENT_ID=opsapp
```

---

## Security Notes

**Why ROPC (Resource Owner Password Credentials)?** This app owns its own login form and is served from the same trusted origin as the app itself — it is a first-party client, not a third party integrating with Keycloak. Redirect-based OIDC flows exist specifically to avoid a client ever seeing the user's raw credentials; that concern doesn't apply here since the login form *is* the client. ROPC is an accepted grant type for exactly this kind of first-party, trusted-client scenario.

**Token storage.** Access, refresh, and ID tokens are stored in `localStorage` (`kc_token`, `kc_refresh_token`, `kc_id_token`) — a deliberate choice, not an oversight. The alternative (in-memory only) would log the user out on every page refresh, since this app has no cookie-based or silent-SSO recovery mechanism to re-establish a session after a reload. The accepted tradeoff is XSS exposure: if malicious script ever runs in this app's origin, it can read these tokens. Mitigate by keeping dependencies patched and avoiding `dangerouslySetInnerHTML`/unsanitized third-party content; this is a separate, ongoing hardening concern from the auth flow itself.

**No tokens in URLs.** ROPC posts credentials and receives tokens in request/response bodies only. `keycloak.logout()`'s `redirectUri` is a return-to address, not a token carrier. No query string or URL fragment ever carries a token in this app.

**`Platform-TenantId` and `Authorization` headers** are injected on every request from both axios instances (`src/lib/api/client.ts` and `src/lib/api/g2pConfig.ts`) via the shared `createAuthInterceptors()` factory in `src/lib/api/authInterceptors.ts`.

**Refresh tokens are never logged.** Every place that reads a token value (`src/lib/keycloak/refresh.ts`, `src/lib/api/authInterceptors.ts`, `src/lib/keycloak/KeycloakProvider.tsx`) only ever logs or surfaces booleans (refreshed / not), HTTP status codes, or `.message` strings — never the token itself. Keep it that way: **never `console.log` a token, refresh token, or ID token value**, even for debugging; log success/failure booleans instead.

---

## Gazelle Backend Setup

To run the dev server against a Mifos Gazelle deployment, add its hosts to your hosts file (`C:\Windows\System32\drivers\etc\hosts` on Windows, `/etc/hosts` on Linux/macOS). Gazelle's own setup (`setup-env.sh`) does this on the machine it runs on.

```
<VM-IP>  ops-bk.mifos.gazelle.test         # Operations backend (BFF): /api/v1
<VM-IP>  keycloak-ops.mifos.gazelle.test   # Keycloak for the Ops UI
<VM-IP>  ops.mifos.gazelle.test            # the Ops UI Gazelle deploys
```

Update `.env.development`:

```env
VITE_API_BASE_URL=https://ops-bk.mifos.gazelle.test/api/v1
VITE_KEYCLOAK_URL=https://keycloak-ops.mifos.gazelle.test
VITE_KEYCLOAK_REALM=paymenthub
VITE_KEYCLOAK_CLIENT_ID=opsapp
```

Gazelle uses self-signed certificates: open each host once in the browser and accept the certificate first. Calls from the dev server are cross-origin, so they work only if Keycloak's `opsapp` client lists `http://localhost:5173` as a web origin and `ops-bk` allows it in its CORS settings.

---

## Routes

| Route | Auth | Description |
|---|---|---|
| `/splash` | Public | Animated splash screen |
| `/login` | Public | In-app Keycloak login (ROPC) |
| `/` | Protected | Dashboard — KPIs, recent batches, quick actions |
| `/payment-hub` | Protected | Main Batches, Sub Batches, Transfers |
| `/vouchers` | Protected | Voucher list, status filters, CSV upload |
| `/account-mapper` | Protected | Beneficiary list and create form |
| `/g2p-config` | Protected | G2P Payment Config list and create |
| `/rbac` | Protected | Role config and user management |
| `/reporting` | Protected | Charts, KPI metrics, failed batch table |
| `/settings` | Protected | App configuration |
| `/account-mapper/self-service` | **Public** | Beneficiary self-service portal (iframe) |

---

## Account Mapper Self-Service Portal

The self-service portal is a standalone, iframe-friendly page for beneficiaries to update their own payment details — no Keycloak credentials required.

**URL format:**
```
/account-mapper/self-service?beneficiaryId={id}
```

**Example:**
```
http://localhost:5173/account-mapper/self-service?beneficiaryId=9876543210
```

- Looks up the beneficiary via `GET /beneficiary/{id}`: a 404 shows "No account details found", any other failure shows "Could not look up your account" with the error (no mock fallback)
- Pre-fills a form with current Financial Institution, Financial Address, and Payment Modality
- On submit calls `PUT /identityAccountMapper/beneficiary` via TanStack Query `useMutation`; a failed update says the details were not updated, with the error
- No sidebar, no header — minimal white card layout, mobile responsive, embeddable in external portals

---

## Building for Production

```bash
npm run build       # mode production: loads .env, .env.production
npm run build:g2p   # mode g2p: loads .env, .env.g2p
```

Both run `tsc -b` and then `vite build`, and write to `dist/`. They differ only in the env values built in. Neither contains mock data: MSW runs only on the dev server (see [docs/MOCK-DATA.md](docs/MOCK-DATA.md)).

## Testing and checks

| Command | What it does | Where it runs automatically |
|---|---|---|
| `npm test` | Vitest, watch mode (`npm test -- --run` once; `test:ui`, `test:coverage`) | CircleCI |
| `npx tsc --noEmit` | Type check only | CircleCI |
| `npm run build` | Type check (`tsc -b`) and build | The image build (`Dockerfile`) |
| `npm run check:no-mock-data` | Fails if `dist/` contains sample data; run after a build | The image build, straight after `npm run build` |
| `npm run lint` | ESLint | Nowhere: `dev` has 13 problems (11 errors, 2 warnings) |

CI is CircleCI (`.circleci/config.yml`): it runs the type check and tests, then builds and pushes the Docker image, whose build runs `npm run build` and `npm run check:no-mock-data`. `.github/workflows/ci.yml` runs the same steps but only when started by hand (`workflow_dispatch`).

## Deploying with Docker

The `Dockerfile` builds the app with Node 20 and serves `dist/` from nginx. At container start, `docker/docker-entrypoint.sh` writes `env-config.js` from the container's environment, so one image works for any deployment. `src/lib/runtime-config.ts` (`getEnv()`) prefers those values over the built-in ones. Read this way: `VITE_API_BASE_URL`, `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID` and `VITE_G2P_SERVICE_URL`. The entrypoint also writes `VITE_BULK_CONNECTOR_URL`, `VITE_TENANT_ID` and `VITE_ENABLE_MSW`, but the app doesn't read them; in particular the container can't turn mock data on.

---

## Contributing

Contributions are welcome.

- All PRs should target the `dev` branch
- Reference the relevant Jira ticket in your PR title: `PHEE-XXX: short description`
- For design references, see the Figma file (link to be added)
- For backend integration questions or access, reach out to the project mentors

---

## Related Links

- [Angular Operations App (reference)](https://github.com/openMF/ph-ee-operations-web)
- [Jira Epic — PHEE-363](https://mifosforge.jira.com/browse/PHEE-363)
- [The Mifos Initiative](https://mifos.org)
- [C4GT DMP 2026](https://codeforgovtech.in)

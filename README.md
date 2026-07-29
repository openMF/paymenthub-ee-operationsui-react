# Payment Hub EE — Operations Web App (React)

A modern React-based rebuild of the Payment Hub EE Operations App, replacing the legacy Angular frontend. Built as part of **C4GT DMP 2026** under the [Mifos Initiative](https://mifos.org), targeting release **2.1.0 (October 2026)**.

> The `main` branch contains release code. All PRs should target the `dev` branch first and will be merged to `main` at release.

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

- **Dashboard** — operational overview with KPI stats, recent batches, recent vouchers, quick actions
- **Payment Hub** — Main Batches, Sub Batches, Transfers with status filters, CSV/PDF export
- **Voucher Management** — voucher list with status filters, bulk CSV upload
- **Account Mapper** — beneficiary management, create beneficiary form, self-service portal
- **G2P Payment Config** — configuration list and create form
- **RBAC** — role configuration cards and user management with lock/unlock
- **Reporting Dashboard** — Recharts line/bar/pie charts, KPI metrics, failed batch table, date/tenant filters
- **Settings** — app configuration with accordion sections
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
│   ├── api/                   # Axios client, API functions (paymentHub, accountMapper)
│   ├── keycloak/              # KeycloakProvider, useAuth hook, singleton
│   ├── exportCsv.ts           # CSV download utility
│   └── exportPdf.ts           # PDF download utility (jsPDF)
├── pages/                     # Thin re-exports wiring modules to routes
├── config/                    # Constants (APP_NAME, TENANTS, DEFAULT_TENANT)
├── main.tsx                   # Router setup, QueryClient, KeycloakProvider
└── index.css                  # Tailwind base layer and theme

root/
├── components.json            # ShadCN CLI config
├── index.html                 # App HTML shell + favicon
├── .env.example               # Environment variable template
└── vite.config.ts
```

---

## Prerequisites

- **Node.js 18+** and npm
- **Docker Desktop** — for running Keycloak locally
- Access to a **Mifos Gazelle** backend instance (or use built-in mock data)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/openMF/ph-ee-operations-web-react.git

# 2. Move into the project directory
cd ph-ee-operations-web-react

# 3. Install dependencies
npm install

# 4. Copy and configure environment variables
cp .env.example .env

# 5. Start the development server
npm run dev
```

Navigate to `http://localhost:5173/` — the app auto-reloads on file changes.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL for the Payment Hub Operations backend (`/api/v1`) |
| `VITE_BULK_CONNECTOR_URL` | URL for Bulk Import / Batch creation backend |
| `VITE_KEYCLOAK_URL` | Keycloak auth server URL (e.g. `http://localhost:8180`) |
| `VITE_KEYCLOAK_REALM` | Keycloak realm (e.g. `paymenthub`) |
| `VITE_KEYCLOAK_CLIENT_ID` | Keycloak client ID (e.g. `opsapp`) |
| `VITE_TENANT_ID` | Default Platform Tenant Identifier used in API calls |

---

## Keycloak Setup (Local Docker)

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

Update `.env`:

```env
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=paymenthub
VITE_KEYCLOAK_CLIENT_ID=opsapp
```

---

## Gazelle Backend Setup

Add to your hosts file (`C:\Windows\System32\drivers\etc\hosts` on Windows, `/etc/hosts` on Linux/macOS):

```
<VM-IP>  ops.mifos.gazelle.test
<VM-IP>  kibana-phee.mifos.gazelle.test
<VM-IP>  zeebe-operate.mifos.gazelle.test
<VM-IP>  bulk-connector.mifos.gazelle.test
```

Update `.env`:

```env
VITE_API_BASE_URL=https://ops.mifos.gazelle.test/api/v1
VITE_BULK_CONNECTOR_URL=https://bulk-connector.mifos.gazelle.test
VITE_TENANT_ID=greenbank
```

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

- Looks up the beneficiary via `GET /beneficiary/{id}` (falls back to mock data if the API is unreachable)
- Pre-fills a form with current Financial Institution, Financial Address, and Payment Modality
- On submit calls `PUT /beneficiary/{id}` via TanStack Query `useMutation`
- No sidebar, no header — minimal white card layout, mobile responsive, embeddable in external portals

---

## Building for Production

```bash
npm run build
```

Build artifacts are output to `dist/`.

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

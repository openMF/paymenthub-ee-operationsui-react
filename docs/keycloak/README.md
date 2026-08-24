# Keycloak Realm Export

`realm-export.json` lets you spin up a fully configured local Keycloak instance in one command instead of clicking through the admin console. See the [Quick Setup section in the main README](../../README.md#quick-setup-recommended--import-realm) for the `docker run` command.

## What the export contains

This is a **realm + client configuration export** — it does not include users. Importing it gives you:

- The **`paymenthub`** realm
- The **`opsapp`** client, pre-configured for the app's ROPC (Direct Grant) login flow:
  - Client authentication: OFF (public client)
  - Direct access grants: ON
  - Valid redirect URIs / web origins for `http://localhost:5173`
- Realm roles and default Keycloak system clients (`account`, `admin-cli`, `broker`, `realm-management`, `security-admin-console`)

It does **not** include any user accounts or passwords — Keycloak realm exports omit user data by default unless explicitly exported "with users." After importing, you still need to create a test user (see below).

## Default test credentials

Create a user in the `paymenthub` realm with:

| Field | Value |
|---|---|
| Username | `mifos` |
| Password | `password` |

Create it via the admin console (`http://localhost:8180` → **Users** → **Add user**, then set the password under the **Credentials** tab and turn **Temporary** off), or via `kcadm`/the Admin REST API if you're scripting setup.

## How to re-export if config changes

If you change the realm or client configuration (new roles, redirect URIs, client scopes, etc.) via the admin console, re-export it so the file in this repo stays current:

```bash
docker exec <keycloak-container-name> \
  /opt/keycloak/bin/kc.sh export \
  --file /tmp/realm-export.json \
  --realm paymenthub

docker cp <keycloak-container-name>:/tmp/realm-export.json ./docs/keycloak/realm-export.json
```

Replace `<keycloak-container-name>` with the running container's name or ID (`docker ps`).

**Do not export with `--users same_file` or `--users realm_file`** — this would embed real or test user data (including password hashes) into a file committed to the repo. Keep users out of the export and document credentials separately, as above.

After re-exporting, review the diff before committing — realm exports include internal IDs and timestamps that change on every export even without a meaningful config change; keep the commit focused on the actual configuration change.

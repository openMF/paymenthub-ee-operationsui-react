#!/bin/sh
# Renders env-config.js from container env vars at startup, so the same image can be
# deployed against any Gazelle domain/backend without a rebuild. Runs automatically:
# the official nginx image executes every *.sh file under /docker-entrypoint.d/ before
# starting nginx. Keep the keys here in sync with src/lib/runtime-config.ts consumers.
set -eu

ENV_FILE=/usr/share/nginx/html/env-config.js

cat > "$ENV_FILE" <<EOF
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-}",
  VITE_BULK_CONNECTOR_URL: "${VITE_BULK_CONNECTOR_URL:-}",
  VITE_TENANT_ID: "${VITE_TENANT_ID:-greenbank}",
  VITE_KEYCLOAK_URL: "${VITE_KEYCLOAK_URL:-}",
  VITE_KEYCLOAK_REALM: "${VITE_KEYCLOAK_REALM:-paymenthub}",
  VITE_KEYCLOAK_CLIENT_ID: "${VITE_KEYCLOAK_CLIENT_ID:-opsapp}",
  VITE_G2P_SERVICE_URL: "${VITE_G2P_SERVICE_URL:-}",
  VITE_ENABLE_MSW: "${VITE_ENABLE_MSW:-false}"
};
EOF

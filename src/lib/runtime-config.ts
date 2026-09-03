// Vite bakes import.meta.env.VITE_* in at build time, which doesn't fit how Gazelle
// deploys this app: one image gets reused across clusters/domains, with values injected
// at container start (see docker/docker-entrypoint.sh -> public/env-config.js). This
// helper prefers that runtime value and falls back to the build-time one for `npm run dev`.

type RuntimeConfig = Record<string, string | undefined>

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig
  }
}

export function getEnv(key: string): string | undefined {
  return window.__RUNTIME_CONFIG__?.[key] || import.meta.env[key]
}

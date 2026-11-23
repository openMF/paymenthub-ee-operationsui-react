// PHEE-468: fails if the production bundle contains sample data. Mock data belongs only in the
// dev-only MSW handlers (src/mocks) and in tests. One marker per former mock file.
// Run after `npm run build`: node scripts/check-no-mock-data.mjs [dist]
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const MARKERS = {
  'BEN-FIN-001': 'account-mapper beneficiaries',
  'BATCH-001-2026': 'payment-hub main batches',
  'a1b2c3d4-0001-0001-0001-000000000001': 'payment-hub batch transactions',
  'ab09d690-7e34-4b3d-b07c-f5a59c020676': 'payment-hub transfers',
  'VCH-2024-001': 'vouchers',
  'admin.a@mifos.org': 'rbac users',
  '410200834521': 'g2p configs',
  'Rural Dev': 'reporting ministry chart',
}

const dist = process.argv[2] ?? 'dist'

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

const bundle = files(dist).filter((f) => /\.(js|html|css|json)$/.test(f) && !f.endsWith('mockServiceWorker.js'))
if (bundle.length === 0) {
  console.error(`No built files in ${dist}: run npm run build first`)
  process.exit(2)
}

let found = 0
for (const file of bundle) {
  const text = readFileSync(file, 'utf8')
  for (const [marker, source] of Object.entries(MARKERS)) {
    if (text.includes(marker)) {
      console.error(`${file}: contains "${marker}" (${source} mock data)`)
      found++
    }
  }
}
if (found > 0) process.exit(1)
console.log(`No mock data in ${bundle.length} built files.`)

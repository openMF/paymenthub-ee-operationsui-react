import { describe, it, expect } from 'vitest'

// PHEE-468: sample data may only reach the app through MSW, and MSW may only start when the
// config asks for it: the Vite dev server with VITE_ENABLE_MSW=true (enableMocking() in
// main.tsx). Screens used to import mock files directly and show them when a call failed,
// whatever the config. These tests fail if that pattern, or an ungated mock import, comes back.
// See docs/MOCK-DATA.md.

const GATE = "if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {"
const ALLOWED_MOCK_IMPORT = "import('./mocks/browser')"

/** Import specifiers in a source file: static, side-effect, re-export and dynamic imports. */
function importSpecifiers(source: string): string[] {
  const found: string[] = []
  const pattern = /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g
  for (const match of source.matchAll(pattern)) found.push(match[1])
  return found
}

/** True for a specifier that reaches sample data or MSW. */
function isMockSpecifier(specifier: string): boolean {
  return /(^|\/)mocks(\/|$)/.test(specifier) || specifier === '@/mocks' || /^msw(\/|$)/.test(specifier)
}

/** The text of the block that `gate` opens, or null if `gate` isn't in `source`. */
function gatedBlock(source: string, gate: string): string | null {
  const start = source.indexOf(gate)
  if (start < 0) return null
  let depth = 0
  for (let i = start + gate.length - 1; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1)
  }
  return null
}

/** Problems with main.tsx's one allowed mock import, or [] if it's only inside the gate. */
function mainImportProblems(main: string): string[] {
  const problems: string[] = []
  const mockImports = importSpecifiers(main).filter(isMockSpecifier)
  if (mockImports.length !== 1 || mockImports[0] !== './mocks/browser') {
    problems.push(`main.tsx must import only './mocks/browser' (found: ${mockImports.join(', ') || 'none'})`)
  }
  const block = gatedBlock(main, GATE)
  if (block === null) problems.push(`main.tsx has no gate: ${GATE}`)
  else if (!block.includes(ALLOWED_MOCK_IMPORT)) problems.push(`${ALLOWED_MOCK_IMPORT} is not inside the gate`)
  else if (main.split(ALLOWED_MOCK_IMPORT).length !== 2) problems.push(`${ALLOWED_MOCK_IMPORT} appears more than once`)
  return problems
}

// Every source file, as text. Test files, test setup and src/mocks itself may use mocks.
const sources = import.meta.glob('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const appFiles = Object.entries(sources).filter(
  ([path]) => !path.startsWith('/src/mocks/') && !path.startsWith('/src/test/') && !/\.test\.tsx?$/.test(path),
)

describe('the mock data gate', () => {
  it('finds the app source files', () => {
    expect(appFiles.length).toBeGreaterThan(20)
    expect(sources['/src/main.tsx']).toBeDefined()
  })

  it('no app file except main.tsx imports sample data or MSW', () => {
    const offenders = appFiles
      .filter(([path]) => path !== '/src/main.tsx')
      .flatMap(([path, source]) => importSpecifiers(source).filter(isMockSpecifier).map((s) => `${path} imports '${s}'`))
    expect(offenders).toEqual([])
  })

  it("main.tsx loads './mocks/browser' only when the config turns mocks on", () => {
    expect(mainImportProblems(sources['/src/main.tsx'])).toEqual([])
  })
})

describe('the gate checks themselves', () => {
  it('catch the old pattern: a screen importing a mock file', () => {
    const screen = "import { mainBatches as mock } from './mocks/mainBatches.mock'\nconst rows = isError ? mock : data"
    expect(importSpecifiers(screen).filter(isMockSpecifier)).toEqual(['./mocks/mainBatches.mock'])
  })

  it('catch alias, dynamic, side-effect and MSW imports', () => {
    const source = [
      "import { transfers } from '@/mocks/data/transfers'",
      "const m = await import('../../mocks/handlers/paymentHub.handlers')",
      "import '@/mocks/browser'",
      "import { http } from 'msw'",
      "export { beneficiaries } from '@/mocks/data/beneficiaries'",
    ].join('\n')
    expect(importSpecifiers(source).filter(isMockSpecifier)).toHaveLength(5)
  })

  it('ignore ordinary imports', () => {
    const source = "import { useQuery } from '@tanstack/react-query'\nimport LoadError from '@/components/shared/LoadError'"
    expect(importSpecifiers(source).filter(isMockSpecifier)).toEqual([])
  })

  it('accept the mock import inside the gate', () => {
    const main = `async function enableMocking() {\n  ${GATE}\n    const { worker } = await ${ALLOWED_MOCK_IMPORT}\n    await worker.start()\n  }\n}`
    expect(mainImportProblems(main)).toEqual([])
  })

  it('reject the mock import outside the gate, or with no gate', () => {
    const outside = `async function enableMocking() {\n  ${GATE}\n    console.log('mocks on')\n  }\n  const { worker } = await ${ALLOWED_MOCK_IMPORT}\n}`
    expect(mainImportProblems(outside)).toEqual([`${ALLOWED_MOCK_IMPORT} is not inside the gate`])
    const ungated = `async function enableMocking() {\n  if (import.meta.env.DEV) {\n    await ${ALLOWED_MOCK_IMPORT}\n  }\n}`
    expect(mainImportProblems(ungated)).toEqual([`main.tsx has no gate: ${GATE}`])
  })

  it('reject a second mock import in main.tsx', () => {
    const main = `import { mainBatches } from './mocks/data/mainBatches'\n${GATE}\n  await ${ALLOWED_MOCK_IMPORT}\n}`
    expect(mainImportProblems(main)[0]).toMatch(/must import only/)
  })
})

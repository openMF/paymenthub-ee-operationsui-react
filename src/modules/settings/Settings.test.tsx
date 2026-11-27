import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Settings from './Settings'
import { readDefaultTenant, saveDefaultTenant } from '@/lib/defaultTenant'

// PHEE-468 (#101): Settings used to show "Settings saved successfully" for every section and
// store nothing. Now only the default tenant is saved (in this browser), the deployment's
// URLs are shown read-only, and the sections that aren't connected say so.

beforeEach(() => {
  localStorage.clear()
  window.__RUNTIME_CONFIG__ = {
    VITE_API_BASE_URL: 'https://ops-bk.example.test/api/v1',
    VITE_KEYCLOAK_URL: 'https://keycloak-ops.example.test',
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  delete window.__RUNTIME_CONFIG__
})

describe('defaultTenant', () => {
  it('reads back a saved tenant and ignores an unknown one', () => {
    expect(readDefaultTenant()).toBeNull()
    saveDefaultTenant('redbank')
    expect(readDefaultTenant()).toBe('redbank')
    localStorage.setItem('defaultTenant', 'gorilla')
    expect(readDefaultTenant()).toBeNull()
  })

  it('refuses an unknown tenant', () => {
    expect(() => saveDefaultTenant('gorilla')).toThrow('Unknown tenant: gorilla')
  })
})

describe('Settings', () => {
  it('shows the running configuration read-only, and "Not set" where it is missing', () => {
    render(<Settings />)
    const backend = screen.getByLabelText('Operations backend URL')
    expect(backend).toHaveValue('https://ops-bk.example.test/api/v1')
    expect(backend).toHaveAttribute('readonly')
    expect(screen.getByLabelText('Keycloak URL')).toHaveValue('https://keycloak-ops.example.test')
    expect(screen.getByLabelText('G2P Payment Config URL')).toHaveValue('Not set')
  })

  it('saves the default tenant and says so only when it was stored', async () => {
    localStorage.setItem('defaultTenant', 'bluebank')
    render(<Settings />)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('status')).toHaveTextContent('Default tenant saved in this browser.')
    expect(localStorage.getItem('defaultTenant')).toBe('bluebank')
  })

  it('reports a failed save instead of success', async () => {
    localStorage.setItem('defaultTenant', 'bluebank')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    render(<Settings />)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Default tenant not saved: QuotaExceededError')
    expect(screen.queryByText(/saved in this browser/)).toBeNull()
  })

  it('has no Save until a tenant is chosen', () => {
    render(<Settings />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it.each([
    ['Images', 'Logo and favicon settings are not available'],
    ['Theme and Font', 'Theme and font settings are not available'],
    ['Contact Information', 'Contact settings are not available'],
  ])('%s says it is not available, with its fields disabled and no Save', async (section, notice) => {
    render(<Settings />)
    await userEvent.click(screen.getByRole('button', { name: section }))
    const region = screen.getByRole('region', { name: section })
    expect(within(region).getByRole('status')).toHaveTextContent(notice)
    expect(within(region).queryByRole('button', { name: 'Save' })).toBeNull()
    for (const field of within(region).queryAllByRole('textbox')) expect(field).toBeDisabled()
  })
})

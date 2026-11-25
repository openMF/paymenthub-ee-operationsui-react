import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle, ImageIcon } from 'lucide-react'
import { NotAvailable } from '@/components/shared/LoadError'
import { TENANTS } from '@/config/constants'
import { getEnv } from '@/lib/runtime-config'
import { readDefaultTenant, saveDefaultTenant } from '@/lib/defaultTenant'
import { errorText } from '@/lib/errorText'

const FONTS = ['Inter', 'Roboto', 'Open Sans']

// Set per deployment (the Docker image's env-config.js, or the build's env file), so shown,
// not edited: a per-browser override would point one console at a different server.
const RUNNING_CONFIG = [
  { label: 'Operations backend URL', key: 'VITE_API_BASE_URL' },
  { label: 'Keycloak URL', key: 'VITE_KEYCLOAK_URL' },
  { label: 'Keycloak realm', key: 'VITE_KEYCLOAK_REALM' },
  { label: 'Keycloak client', key: 'VITE_KEYCLOAK_CLIENT_ID' },
  { label: 'G2P Payment Config URL', key: 'VITE_G2P_SERVICE_URL' },
]

type SaveState = { ok: true } | { ok: false; error: unknown } | null

export default function Settings() {
  const [defaultTenant, setDefaultTenant] = useState(() => readDefaultTenant() ?? '')
  const [saved, setSaved] = useState<SaveState>(null)

  function handleSaveDefaultTenant() {
    try {
      saveDefaultTenant(defaultTenant)
      setSaved({ ok: true })
    } catch (error) {
      setSaved({ ok: false, error })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="rounded-lg border bg-white">
        <Accordion type="single" collapsible defaultValue="main-config" className="px-4">
          {/* 1. Main Configuration */}
          <AccordionItem value="main-config">
            <AccordionTrigger>Main Configuration</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <section className="space-y-3" aria-labelledby="running-config">
                  <div>
                    <h2 id="running-config" className="text-sm font-medium">Running configuration</h2>
                    <p className="text-sm text-muted-foreground">
                      Set for this deployment, not here: in the container's environment, or the build's env file.
                    </p>
                  </div>
                  {RUNNING_CONFIG.map(({ label, key }) => {
                    const value = getEnv(key)
                    return (
                      <div key={key} className="space-y-1.5">
                        <Label htmlFor={key}>{label}</Label>
                        <Input id={key} readOnly value={value || 'Not set'} className="font-mono text-sm bg-gray-50" />
                      </div>
                    )
                  })}
                </section>

                <section className="space-y-3" aria-labelledby="default-tenant-heading">
                  <div>
                    <h2 id="default-tenant-heading" className="text-sm font-medium">Default tenant</h2>
                    <p className="text-sm text-muted-foreground">
                      The tenant the login screen starts with, in this browser. Switch the tenant you are using from the header.
                    </p>
                  </div>
                  {saved?.ok && (
                    <div role="status" className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      Default tenant saved in this browser.
                    </div>
                  )}
                  {saved && !saved.ok && (
                    <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Default tenant not saved: {errorText(saved.error)}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultTenant">Default tenant</Label>
                    <Select
                      value={defaultTenant}
                      onValueChange={(value) => {
                        setDefaultTenant(value)
                        setSaved(null)
                      }}
                    >
                      <SelectTrigger id="defaultTenant" className="w-full">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {TENANTS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="bg-[#1565C0] hover:bg-[#0d47a1] text-white"
                    disabled={!defaultTenant}
                    onClick={handleSaveDefaultTenant}
                  >
                    Save
                  </Button>
                </section>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Images */}
          <AccordionItem value="images">
            <AccordionTrigger>Images</AccordionTrigger>
            <AccordionContent>
              <fieldset disabled className="space-y-4">
                <NotAvailable what="Logo and favicon settings are" />
                <div className="space-y-1.5">
                  <Label>Logo Upload</Label>
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Logo upload (PNG, JPG)</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Favicon Upload</Label>
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-6 text-gray-400">
                    <span className="text-sm">Favicon upload (.ico, .png)</span>
                  </div>
                </div>
              </fieldset>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Theme and Font */}
          <AccordionItem value="theme">
            <AccordionTrigger>Theme and Font</AccordionTrigger>
            <AccordionContent>
              <fieldset disabled className="space-y-4">
                <NotAvailable what="Theme and font settings are" />
                <div className="space-y-1.5">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input id="primaryColor" value="#1565C0" readOnly className="w-32 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select disabled>
                    <SelectTrigger id="fontFamily" className="w-full">
                      <SelectValue placeholder={FONTS[0]} />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="darkMode" checked={false} disabled />
                  <Label htmlFor="darkMode" className="font-normal">Dark Mode</Label>
                </div>
              </fieldset>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Contact Information */}
          <AccordionItem value="contact">
            <AccordionTrigger>Contact Information</AccordionTrigger>
            <AccordionContent>
              <fieldset disabled className="space-y-4">
                <NotAvailable what="Contact settings are" />
                <div className="space-y-1.5">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input id="supportEmail" type="email" placeholder="support@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="helpDeskUrl">Help Desk URL</Label>
                  <Input id="helpDeskUrl" placeholder="https://helpdesk.example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" placeholder="Enter organization name" />
                </div>
              </fieldset>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

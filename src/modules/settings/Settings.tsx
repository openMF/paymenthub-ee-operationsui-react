import React, { useState } from 'react'
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
import { CheckCircle, ImageIcon } from 'lucide-react'

const TENANTS = ['greenbank', 'bluebank', 'redbank']
const FONTS = ['Inter', 'Roboto', 'Open Sans']

function SuccessAlert() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      <CheckCircle className="h-4 w-4 shrink-0" />
      Settings saved successfully
    </div>
  )
}

export default function Settings() {
  // Main Configuration
  const [backendUrl, setBackendUrl] = useState('')
  const [connectorUrl, setConnectorUrl] = useState('')
  const [defaultTenant, setDefaultTenant] = useState('')
  const [mainSaved, setMainSaved] = useState(false)

  // Images
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Theme
  const [primaryColor, setPrimaryColor] = useState('#1565C0')
  const [fontFamily, setFontFamily] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [themeSaved, setThemeSaved] = useState(false)

  // Contact
  const [supportEmail, setSupportEmail] = useState('')
  const [helpDeskUrl, setHelpDeskUrl] = useState('')
  const [orgName, setOrgName] = useState('')
  const [contactSaved, setContactSaved] = useState(false)

  function saveWithFeedback(
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    setter(true)
    setTimeout(() => setter(false), 2500)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="rounded-lg border bg-white">
        <Accordion type="single" collapsible className="px-4">
          {/* 1. Main Configuration */}
          <AccordionItem value="main-config">
            <AccordionTrigger>Main Configuration</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {mainSaved && <SuccessAlert />}

                <div className="space-y-1.5">
                  <Label htmlFor="backendUrl">Operations Backend URL</Label>
                  <Input
                    id="backendUrl"
                    placeholder="http://ops.mifos.gazelle.test/api/v1"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="connectorUrl">Bulk Connector URL</Label>
                  <Input
                    id="connectorUrl"
                    placeholder="https://ops.mifos.gazelle.test"
                    value={connectorUrl}
                    onChange={(e) => setConnectorUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="defaultTenant">Default Tenant</Label>
                  <Select value={defaultTenant} onValueChange={setDefaultTenant}>
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
                  onClick={() => saveWithFeedback(setMainSaved)}
                >
                  Save
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Images */}
          <AccordionItem value="images">
            <AccordionTrigger>Images</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Logo upload */}
                <div className="space-y-1.5">
                  <Label>Logo Upload</Label>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 cursor-pointer hover:bg-gray-100 transition-colors">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-muted-foreground">
                      Drag & drop or click to upload logo
                    </span>
                    <span className="text-xs text-gray-400">PNG, JPG up to 2MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>

                {/* Favicon upload */}
                <div className="space-y-1.5">
                  <Label>Favicon Upload</Label>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-6 cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-sm text-muted-foreground">
                      Click to upload favicon (.ico, .png)
                    </span>
                    <input type="file" accept=".ico,image/png" className="hidden" />
                  </label>
                </div>

                {/* Preview */}
                {logoPreview && (
                  <div className="space-y-1.5">
                    <Label>Current Logo Preview</Label>
                    <div className="rounded-lg border bg-gray-50 p-4 flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-16 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Theme and Font */}
          <AccordionItem value="theme">
            <AccordionTrigger>Theme and Font</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {themeSaved && <SuccessAlert />}

                <div className="space-y-1.5">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border border-input p-0.5"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32 font-mono"
                      placeholder="#1565C0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger id="fontFamily" className="w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                  <Label htmlFor="darkMode" className="font-normal cursor-pointer">
                    Dark Mode
                  </Label>
                </div>

                <Button
                  className="bg-[#1565C0] hover:bg-[#0d47a1] text-white"
                  onClick={() => saveWithFeedback(setThemeSaved)}
                >
                  Save
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Contact Information */}
          <AccordionItem value="contact">
            <AccordionTrigger>Contact Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {contactSaved && <SuccessAlert />}

                <div className="space-y-1.5">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    placeholder="support@example.com"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="helpDeskUrl">Help Desk URL</Label>
                  <Input
                    id="helpDeskUrl"
                    placeholder="https://helpdesk.example.com"
                    value={helpDeskUrl}
                    onChange={(e) => setHelpDeskUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="Enter organization name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>

                <Button
                  className="bg-[#1565C0] hover:bg-[#0d47a1] text-white"
                  onClick={() => saveWithFeedback(setContactSaved)}
                >
                  Save
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

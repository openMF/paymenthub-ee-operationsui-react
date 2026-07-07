import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BeneficiariesTab from './BeneficiariesTab'
import CreateBeneficiariesTab from './CreateBeneficiariesTab'

export default function AccountMapper() {
  const [tab, setTab] = useState('beneficiaries')

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Account Mapper</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight">Account Mapper</h1>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line">
          <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          <TabsTrigger value="create-beneficiaries">Create Beneficiaries</TabsTrigger>
        </TabsList>

        <TabsContent value="beneficiaries" className="mt-4">
          <BeneficiariesTab />
        </TabsContent>

        <TabsContent value="create-beneficiaries" className="mt-4">
          <CreateBeneficiariesTab
            onCancel={() => setTab('beneficiaries')}
            onSuccess={() => setTab('beneficiaries')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
